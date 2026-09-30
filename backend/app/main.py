import os
import json
import asyncio
from fastapi import FastAPI, UploadFile, File, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

from app.database import (
    init_db,
    save_skus,
    save_sales_transactions,
    clear_data,
    get_latest_report,
    get_all_skus,
    get_db_connection
)
from app.schemas import SkuMetadata, FullWeeklyReport
from app.agents.state import RetailState
from app.agents.graph import execute_retail_pipeline, stream_retail_pipeline
from app.agents.orchestrator import answer_sku_explanation_query
from app.synthetic_data import generate_synthetic_retail_data, get_engineered_showcase_skus_info
from app.utils.csv_validator import validate_sales_csv
from app.utils.llm_client import call_groq_llm

app = FastAPI(
    title="Small Retail Survival Agent API",
    description="Multi-agent GenAI system helping small kirana shops, boutiques, and cafes optimize inventory and promotions.",
    version="1.0.0"
)

# Enable CORS for local Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()
    # If DB is empty, auto-seed with synthetic data so the app works out of the box!
    conn = get_db_connection()
    count = conn.execute("SELECT COUNT(*) as c FROM sales_transactions").fetchone()["c"]
    conn.close()
    if count == 0:
        print("[Startup] Database empty. Seeding with 12-month synthetic retail dataset...")
        skus, txs = generate_synthetic_retail_data(days=365)
        save_skus(skus)
        save_sales_transactions(txs)
        # Pre-run analysis so a report exists immediately
        sku_meta_map = {s["sku"]: SkuMetadata(**s) for s in skus}
        init_state = RetailState(
            raw_transactions=txs,
            skus_metadata=sku_meta_map
        )
        execute_retail_pipeline(init_state)
        print("[Startup] Seed dataset and initial report generated successfully!")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Small Retail Survival Agent"}

@app.get("/api/showcases")
def get_showcases():
    """Returns the 3 engineered showcase demo scenarios."""
    return {"showcases": get_engineered_showcase_skus_info()}

@app.get("/api/skus")
def list_skus():
    """Returns all SKUs with current stock levels."""
    skus = get_all_skus()
    return {"skus": skus, "count": len(skus)}

@app.post("/api/generate-synthetic")
def seed_synthetic_data(days: int = 365):
    """
    Generates fresh 12-month synthetic data, loads into SQLite, and executes the multi-agent pipeline.
    """
    clear_data()
    skus, txs = generate_synthetic_retail_data(days=days)
    save_skus(skus)
    save_sales_transactions(txs)
    
    sku_meta_map = {s["sku"]: SkuMetadata(**s) for s in skus}
    init_state = RetailState(
        raw_transactions=txs,
        skus_metadata=sku_meta_map
    )
    final_state = execute_retail_pipeline(init_state)
    
    return {
        "status": "success",
        "message": f"Successfully generated {len(txs)} transactions across {len(skus)} SKUs spanning {days} days.",
        "report": final_state.final_report.model_dump() if final_state.final_report else None
    }

@app.post("/api/upload")
async def upload_sales_csv(file: UploadFile = File(...)):
    """
    Uploads a sales CSV, validates schema and row-level business rules, and loads into SQLite.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are supported.")
        
    content = await file.read()
    is_valid, errors, warnings, transactions, inferred_skus = validate_sales_csv(content)
    
    if not is_valid:
        raise HTTPException(status_code=422, detail={
            "message": "CSV validation failed",
            "errors": errors,
            "warnings": warnings
        })
        
    clear_data()
    save_skus(inferred_skus)
    save_sales_transactions(transactions)
    
    return {
        "status": "success",
        "filename": file.filename,
        "rows_processed": len(transactions),
        "skus_identified": len(inferred_skus),
        "validation_errors_cleaned": errors,
        "warnings": warnings
    }

@app.post("/api/analyze")
def run_analysis():
    """
    Executes the 5 LangGraph agent nodes synchronously and returns the complete weekly report.
    """
    conn = get_db_connection()
    tx_rows = conn.execute("SELECT date, sku, category, units_sold, unit_price, stock_on_hand FROM sales_transactions ORDER BY date ASC").fetchall()
    sku_rows = conn.execute("SELECT * FROM skus").fetchall()
    conn.close()
    
    if not tx_rows:
        raise HTTPException(status_code=400, detail="No transactions found in database. Please upload CSV or load demo data first.")
        
    txs = [dict(r) for r in tx_rows]
    skus_metadata = {r["sku"]: SkuMetadata(**dict(r)) for r in sku_rows}
    
    init_state = RetailState(
        raw_transactions=txs,
        skus_metadata=skus_metadata
    )
    
    final_state = execute_retail_pipeline(init_state)
    
    if not final_state.final_report:
        raise HTTPException(status_code=500, detail="Analysis failed to produce final report.")
        
    return final_state.final_report.model_dump()

@app.get("/api/analyze/stream")
async def stream_analysis():
    """
    SSE stream endpoint yielding agent execution status step-by-step for real-time frontend visualization.
    """
    conn = get_db_connection()
    tx_rows = conn.execute("SELECT date, sku, category, units_sold, unit_price, stock_on_hand FROM sales_transactions ORDER BY date ASC").fetchall()
    sku_rows = conn.execute("SELECT * FROM skus").fetchall()
    conn.close()
    
    if not tx_rows:
        async def err_stream():
            yield f"data: {json.dumps({'event': 'error', 'message': 'No data found'})}\n\n"
        return StreamingResponse(err_stream(), media_type="text/event-stream")
        
    txs = [dict(r) for r in tx_rows]
    skus_metadata = {r["sku"]: SkuMetadata(**dict(r)) for r in sku_rows}
    
    init_state = RetailState(
        raw_transactions=txs,
        skus_metadata=skus_metadata
    )
    
    async def event_generator():
        for event in stream_retail_pipeline(init_state):
            yield f"data: {json.dumps(event)}\n\n"
            await asyncio.sleep(0.3)  # Brief pause so UI animation renders smoothly
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.get("/api/report/latest")
def get_latest():
    """
    Retrieves the most recent generated report.
    """
    report = get_latest_report()
    if not report:
        raise HTTPException(status_code=404, detail="No reports found yet.")
    return report

@app.get("/api/explain/{sku}")
def explain_sku(sku: str, question: Optional[str] = None):
    """
    Orchestrator explainability Q&A: 'Why did you recommend this?' for a specific SKU.
    """
    report_data = get_latest_report()
    if not report_data:
        raise HTTPException(status_code=404, detail="No report available to query.")
        
    try:
        report = FullWeeklyReport(**report_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse report: {str(e)}")
        
    explanation = answer_sku_explanation_query(sku, report, question)
    return explanation

class ChatRequest(BaseModel):
    message: str
    sku: Optional[str] = None

@app.post("/api/chat")
def store_advisor_chat(req: ChatRequest):
    """
    Interactive Q&A with Orchestrator over the store's current numbers and strategy.
    """
    report_data = get_latest_report()
    if not report_data:
        raise HTTPException(status_code=404, detail="No active report available. Please run analysis first.")
        
    report = FullWeeklyReport(**report_data)
    
    if req.sku:
        return answer_sku_explanation_query(req.sku, report, req.message)
        
    # Global store question
    context_brief = (
        f"Store Overview: Total Revenue ₹{report.sales_summary.total_revenue:,.0f} from {report.date_range_start} to {report.date_range_end}.\n"
        f"Stockout Risks ({len(report.strategist.stockout_risks)}): {[s.name + ' (' + str(s.days_of_stock_left) + 'd left)' for s in report.strategist.stockout_risks[:3]]}\n"
        f"Clearance / Dead Capital: ₹{report.strategist.total_capital_in_dead_stock:,.0f} locked.\n"
        f"Featured Weekly Promotion: {report.marketing.selected_promotion.promo_title}\n"
        f"Action Checklist: {report.orchestrator.action_checklist}"
    )
    
    prompt = f"""
    You are the Lead Retail Orchestrator AI advising a shop owner.
    User Question: "{req.message}"
    
    Current Store Context:
    {context_brief}

    Answer clearly, concisely, and encouragingly in 2-3 short paragraphs, citing specific numbers from the context above.
    """
    
    ans = call_groq_llm(prompt, system_prompt="You are a trusted, experienced retail advisor for independent shopkeepers.")
    if not ans or len(ans.strip()) < 30:
        ans = (
            f"Based on your latest numbers, your store is performing well with ₹{report.sales_summary.total_revenue:,.0f} in revenue. "
            f"Your most critical priority right now is replenishing your fast-selling staples before stockouts hit, "
            f"while pushing this week's promotion ('{report.marketing.selected_promotion.promo_title}') to maintain strong weekend cash flow."
        )
        
    return {
        "question": req.message,
        "answer": ans
    }

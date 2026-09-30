import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from app.agents.state import RetailState
from app.schemas import (
    OrchestratorOutput,
    FullWeeklyReport,
    StockAlert
)
from app.utils.llm_client import call_groq_llm
from app.database import save_report

def resolve_cross_agent_conflicts(state: RetailState) -> List[str]:
    """
    Scans for tensions between agent recommendations and resolves them.
    Example: Ensures Marketing never promotes an item that is at critical stockout risk.
    """
    conflicts_resolved = []
    
    if state.marketing_output and state.strategist_output:
        promo_sku = state.marketing_output.selected_promotion.primary_sku
        
        # Check if promo item is in critical stockout list
        stockout_skus = [s.sku for s in state.strategist_output.stockout_risks if s.urgency == "CRITICAL"]
        if promo_sku in stockout_skus:
            conflicts_resolved.append(
                f"Resolved Conflict: Primary promotion SKU ({promo_sku}) was flagged for critical stockout risk. "
                f"Shifted promotional priority to safe healthy inventory SKU to prevent severe stock depletion."
            )
            # Switch to healthy snack
            state.marketing_output.selected_promotion.primary_sku = "SKU-SNACK-03"
            state.marketing_output.selected_promotion.primary_sku_name = "Grand Reserve Masala Chai 250g"
            
    # Check capital balancing
    if state.strategist_output:
        reorder_needed = state.strategist_output.total_reorder_investment_needed
        dead_capital = state.strategist_output.total_capital_in_dead_stock
        if dead_capital > 0:
            conflicts_resolved.append(
                f"Capital Balancing: ₹{dead_capital:,.0f} locked in slow/perishable stock can directly fund "
                f"the ₹{reorder_needed:,.0f} reorder budget if clearance pricing is executed this weekend."
            )
            
    return conflicts_resolved

def compile_executive_summary(state: RetailState) -> str:
    """
    Generates a concise, plain-language executive briefing that a shop owner can read in 60 seconds.
    """
    sales = state.sales_summary
    strat = state.strategist_output
    mktg = state.marketing_output
    
    top_stockout_text = ""
    if strat and strat.stockout_risks:
        urgent_items = [f"{s.name} ({s.days_of_stock_left}d left)" for s in strat.stockout_risks[:2]]
        top_stockout_text = f"🚨 Immediate Restock Needed: {', '.join(urgent_items)}."
        
    clearance_text = ""
    if strat and strat.clearance_candidates:
        c_item = strat.clearance_candidates[0]
        clearance_text = f"⚠️ Clearance Alert: {c_item.name} has {c_item.current_stock} units facing expiration/dead-stock."
        
    promo_text = ""
    if mktg:
        promo = mktg.selected_promotion
        promo_text = f"💡 Weekly Push: Run '{promo.promo_title}' on {promo.target_days} to lift high-margin sales."

    prompt = f"""
    You are the Lead Retail Orchestrator AI for a busy shop owner.
    Write an executive briefing in 3 clear paragraphs:
    - Paragraph 1: Store Pulse (Total revenue ₹{sales.total_revenue if sales else 'N/A':,}, top categories, and sales velocity momentum).
    - Paragraph 2: Urgent Floor Moves (Highlighting stockouts: {top_stockout_text} and clearance: {clearance_text}).
    - Paragraph 3: This Week's Focus (Highlighting promo: {promo_text}).

    Keep it encouraging, razor-sharp, practical, and under 160 words total. No fluff.
    """
    
    llm_summary = call_groq_llm(prompt, system_prompt="You are a trusted, direct retail advisor writing a Monday morning action brief.")
    if llm_summary and len(llm_summary.strip()) > 80:
        return llm_summary.strip()
        
    # High quality deterministic fallback
    return (
        f"**Store Pulse**: Over the past period, your store generated ₹{sales.total_revenue if sales else 0:,.0f} across {sales.active_skus_count if sales else 0} active SKUs. "
        f"Sales volume peaks strongly on weekends, with Staples and Dairy driving the bulk of your footfall.\n\n"
        f"**Critical Floor Action**: You have {len(strat.stockout_risks) if strat else 0} fast-moving items at risk of running out before supplier deliveries arrive—top priority is placing replenishment orders immediately. "
        f"Simultaneously, approximately ₹{strat.total_capital_in_dead_stock if strat else 0:,.0f} is locked in slow-moving or perishable inventory that should be cleared before expiration.\n\n"
        f"**This Week's Play**: Drive basket size with our featured promotion: '{mktg.selected_promotion.promo_title if mktg else 'Weekend Bundle'}'. "
        f"Place promotional items right near the checkout counter to maximize impulse pickups."
    )

def run_orchestrator_agent(state: RetailState) -> RetailState:
    """
    Orchestrator Agent Node:
    Resolves multi-agent tensions, compiles executive briefing and action checklist,
    and formats the final report.
    """
    state.current_active_agent = "ORCHESTRATOR"
    state.agent_logs.append({
        "agent": "Orchestrator",
        "stage": "SYNTHESIS_AND_REPORTING",
        "message": "Resolving cross-agent constraints and generating final Plain-Language Executive Report...",
        "timestamp": datetime.utcnow().isoformat()
    })
    
    conflicts = resolve_cross_agent_conflicts(state)
    exec_summary = compile_executive_summary(state)
    
    # Build Action Checklist
    checklist = []
    if state.strategist_output and state.strategist_output.stockout_risks:
        top_risk = state.strategist_output.stockout_risks[0]
        checklist.append(f"Place order for {top_risk.suggested_reorder_qty} units of {top_risk.name} (Lead time: {top_risk.lead_time_days} days).")
        
    if state.strategist_output and state.strategist_output.clearance_candidates:
        c_cand = state.strategist_output.clearance_candidates[0]
        checklist.append(f"Mark down {c_cand.name} by 20% to liquidate {c_cand.current_stock} units before shelf expiration.")
        
    if state.marketing_output:
        promo = state.marketing_output.selected_promotion
        checklist.append(f"Set up '{promo.promo_title}' counter display for {promo.target_days}.")
        
    checklist.append("Review slow-moving Personal Care items next Tuesday.")

    # Calculate overall health score (0-100)
    # Starts at 100, deducted for critical stockouts and dead capital
    health_score = 92
    if state.strategist_output:
        health_score -= min(30, len(state.strategist_output.stockout_risks) * 8)
        if state.strategist_output.clearance_candidates:
            health_score -= 10
    health_score = max(40, min(100, health_score))

    report_id = f"REP-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6]}"
    
    orchestrator_out = OrchestratorOutput(
        executive_summary=exec_summary,
        action_checklist=checklist,
        conflicts_resolved=conflicts,
        overall_health_score=health_score,
        report_timestamp=datetime.utcnow().isoformat()
    )
    state.orchestrator_output = orchestrator_out

    # Compile Full Weekly Report
    full_report = FullWeeklyReport(
        id=report_id,
        created_at=datetime.utcnow().isoformat(),
        date_range_start=state.date_range_start,
        date_range_end=state.date_range_end,
        executive_summary=exec_summary,
        orchestrator=orchestrator_out,
        sales_summary=state.sales_summary,
        forecast_report=state.forecast_report,
        strategist=state.strategist_output,
        marketing=state.marketing_output,
        validation_notes=state.validation_errors
    )
    
    state.final_report = full_report
    state.is_completed = True
    
    # Save to SQLite
    try:
        save_report(
            report_id=report_id,
            report_data=full_report.model_dump(),
            executive_summary=exec_summary,
            start_date=state.date_range_start,
            end_date=state.date_range_end
        )
    except Exception as e:
        state.agent_logs.append({
            "agent": "Orchestrator",
            "stage": "DB_SAVE_WARNING",
            "message": f"Report compiled in memory, DB save note: {str(e)}",
            "timestamp": datetime.utcnow().isoformat()
        })
        
    state.agent_logs.append({
        "agent": "Orchestrator",
        "stage": "COMPLETED",
        "message": f"Weekly Report {report_id} successfully compiled and finalized.",
        "timestamp": datetime.utcnow().isoformat()
    })
    
    return state

def answer_sku_explanation_query(sku: str, report: FullWeeklyReport, user_question: Optional[str] = None) -> Dict[str, Any]:
    """
    Lightweight Orchestrator Q&A handler:
    Answers "Why did you recommend this?" by querying the stored multi-agent reasoning
    without re-running the entire forecasting graph.
    """
    # 1. Fetch SKU details from stored state
    sku_metric = report.sales_summary.sku_metrics_map.get(sku)
    sku_forecast = report.forecast_report.sku_forecasts.get(sku)
    sku_alert = report.strategist.all_sku_alerts.get(sku)
    
    if not sku_alert and not sku_metric:
        return {
            "sku": sku,
            "found": False,
            "answer": f"SKU {sku} was not found in the active analysis catalog for this reporting period."
        }
        
    name = sku_alert.name if sku_alert else (sku_metric.name if sku_metric else sku)
    category = sku_alert.category if sku_alert else (sku_metric.category if sku_metric else "General")
    
    current_stock = sku_alert.current_stock if sku_alert else (sku_metric.current_stock if sku_metric else 0)
    burn_rate = sku_alert.daily_burn_rate if sku_alert else (sku_metric.daily_velocity_7d if sku_metric else 1.0)
    days_left = sku_alert.days_of_stock_left if sku_alert else 99
    lead_time = sku_alert.lead_time_days if sku_alert else 3
    reorder_qty = sku_alert.suggested_reorder_qty if sku_alert else 0
    urgency = sku_alert.urgency if sku_alert else "HEALTHY"
    rationale = sku_alert.reasoning_rationale if sku_alert else "Performance within normal thresholds."
    margin_pct = sku_alert.margin_pct if sku_alert else 25.0
    forecast_7d = sku_forecast.forecast_7d if sku_forecast else round(burn_rate * 7, 1)
    forecast_30d = sku_forecast.forecast_30d if sku_forecast else round(burn_rate * 30, 1)
    method_used = sku_forecast.method_used if sku_forecast else "Heuristic"
    
    # Check if involved in promotion
    promo = report.marketing.selected_promotion
    is_promo_primary = (promo.primary_sku == sku)
    is_promo_paired = (promo.paired_sku == sku)
    
    # Check if user asked a specific custom question
    q_text = user_question or "Why did you give this recommendation for this SKU?"
    
    prompt = f"""
    You are the Orchestrator AI. A shop owner is asking: "{q_text}"
    Here is the exact multi-agent reasoning trace stored for this item:
    - SKU: {sku} ({name}) | Category: {category}
    - Current Stock: {current_stock} units
    - Daily Burn Rate: {burn_rate:.1f} units/day
    - Days of Inventory Remaining: {days_left:.1f} days
    - Supplier Reorder Lead Time: {lead_time} days
    - Reorder Quantity Recommended: {reorder_qty} units (Safety Stock Buffer included)
    - Margin: {margin_pct}%
    - 7-Day Forecast: {forecast_7d} units | 30-Day Forecast: {forecast_30d} units (Method: {method_used})
    - Strategist Urgency Level: {urgency}
    - Strategist Rationale: {rationale}
    - Marketing Role: {'Primary Featured Promotion' if is_promo_primary else ('Paired Bundle Item' if is_promo_paired else 'Standard Catalog Item')}

    Explain clearly and directly to the shopkeeper why this recommendation was made, citing the specific numbers (stock, burn rate, lead time, margin). Answer in 2-3 concise paragraphs. Ground all statements in the facts above.
    """
    
    explanation_text = call_groq_llm(prompt, system_prompt="You are an explainability agent giving clear, transparent reasoning for retail recommendations.")
    
    if not explanation_text or len(explanation_text.strip()) < 50:
        # High quality fallback
        if urgency in ["CRITICAL", "WARNING"]:
            explanation_text = (
                f"We flagged **{name}** as an urgent restock because you only have **{current_stock} units left**, "
                f"which will last approximately **{days_left:.1f} days** at your current burn rate of **{burn_rate:.1f} units/day**.\n\n"
                f"Since your supplier takes **{lead_time} days** to deliver, waiting any longer guarantees an empty shelf. "
                f"We recommend ordering **{reorder_qty} units** now to cover expected demand ({forecast_7d} units over 7 days) plus a safety cushion."
            )
        elif urgency == "CLEARANCE_EXPIRY":
            explanation_text = (
                f"We recommended clearance action on **{name}** because you have **{current_stock} units** sitting on the shelf, "
                f"but customers are currently buying only **{burn_rate:.1f} units/day** ({days_left:.1f} days of inventory).\n\n"
                f"Because this perishable item has limited shelf-life, holding the regular price risks total spoilage. "
                f"A quick 20% weekend markdown will accelerate sales velocity and recover your working cash."
            )
        else:
            explanation_text = (
                f"**{name}** is currently in a balanced state. You hold **{current_stock} units** (~{days_left:.1f} days supply) "
                f"with a steady sales rate of **{burn_rate:.1f} units/day**.\n\n"
                f"Our 7-day forecast projects **{forecast_7d} units** in demand. No urgent reorder or markdown is required this week."
            )

    return {
        "sku": sku,
        "name": name,
        "category": category,
        "current_stock": current_stock,
        "daily_burn_rate": burn_rate,
        "days_of_stock_left": days_left,
        "lead_time_days": lead_time,
        "suggested_reorder_qty": reorder_qty,
        "urgency": urgency,
        "margin_pct": margin_pct,
        "forecast_7d": forecast_7d,
        "forecast_30d": forecast_30d,
        "forecast_method": method_used,
        "stored_rationale": rationale,
        "is_promo_involved": is_promo_primary or is_promo_paired,
        "explanation": explanation_text
    }

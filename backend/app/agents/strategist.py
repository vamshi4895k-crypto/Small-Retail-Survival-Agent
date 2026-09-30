import math
from datetime import datetime
from typing import Dict, Any, List
from app.agents.state import RetailState
from app.schemas import StockAlert, StrategistOutput
from app.utils.llm_client import call_groq_llm

def compute_stock_alerts_and_reasoning(state: RetailState) -> StrategistOutput:
    """
    Evaluates inventory risks, lead times, capital locked up, and shelf life constraints.
    Applies multi-factor reasoning combining arithmetic inventory math and LLM decisioning.
    """
    stockout_risks: List[StockAlert] = []
    overstock_candidates: List[StockAlert] = []
    clearance_candidates: List[StockAlert] = []
    healthy_skus: List[StockAlert] = []
    all_sku_alerts: Dict[str, StockAlert] = {}
    
    total_dead_stock_capital = 0.0
    total_reorder_investment = 0.0
    
    for sku, forecast in state.forecast_report.sku_forecasts.items():
        meta = state.skus_metadata.get(sku)
        cost_price = meta.cost_price if meta else 50.0
        shelf_life = meta.shelf_life_days if meta else None
        lead_time = meta.reorder_lead_time_days if meta else 3
        
        metric = state.sales_summary.sku_metrics_map.get(sku) if state.sales_summary else None
        current_stock = metric.current_stock if metric else 0
        avg_price = metric.avg_unit_price if metric else (cost_price * 1.3)
        margin_pct = round(((avg_price - cost_price) / (avg_price or 1.0)) * 100, 1)
        
        daily_burn = max(0.1, forecast.burn_rate_daily)
        days_of_stock = round(current_stock / daily_burn, 1) if daily_burn > 0 else 999.0
        
        # Safety stock buffer calculation (e.g. 50% of lead time demand, minimum 2 units)
        lead_time_demand = daily_burn * lead_time
        safety_buffer = max(2, math.ceil(daily_burn * math.sqrt(lead_time) * 0.8))
        
        # Target stock cover is lead time + 14 days normal cycle + safety buffer
        target_stock_level = math.ceil((lead_time + 14) * daily_burn + safety_buffer)
        raw_reorder = target_stock_level - current_stock
        suggested_reorder_qty = max(0, raw_reorder)
        
        # Capital tied up in this SKU
        capital_locked = round(current_stock * cost_price, 2)
        
        # Diagnostic Classification & Grounded Rationale
        is_stockout = False
        is_clearance = False
        is_overstock = False
        
        # 1. Perishable shelf-life risk check
        if shelf_life is not None and days_of_stock > shelf_life:
            is_clearance = True
            urgency = "CLEARANCE_EXPIRY"
            alert_type = "SPOILAGE_RISK"
            spoilage_units = max(0, int(current_stock - (daily_burn * shelf_life)))
            spoilage_loss = round(spoilage_units * cost_price, 2)
            total_dead_stock_capital += capital_locked
            
            rationale = (
                f"Perishable risk: {current_stock} units in stock with only {shelf_life} days shelf-life remaining, "
                f"but burning at {daily_burn}/day ({days_of_stock} days of supply). An estimated {spoilage_units} units "
                f"(₹{spoilage_loss:,.0f} cost) will spoil if not accelerated immediately via discount or bundle."
            )
            suggested_reorder_qty = 0
            
        # 2. Imminent Stockout Risk (Stock runs out in <= lead_time + 1 day)
        elif days_of_stock <= (lead_time + 1.5):
            is_stockout = True
            urgency = "CRITICAL" if days_of_stock <= lead_time else "WARNING"
            alert_type = "STOCKOUT_RISK"
            reorder_cost = round(suggested_reorder_qty * cost_price, 2)
            total_reorder_investment += reorder_cost
            
            rationale = (
                f"Critical stockout risk: Only {current_stock} units left ({days_of_stock} days of supply) "
                f"with a {lead_time}-day supplier lead time. Demand is {daily_burn:.1f} units/day. "
                f"Place an immediate reorder for {suggested_reorder_qty} units (₹{reorder_cost:,.0f} investment, margin {margin_pct}%)."
            )
            
        # 3. Overstock / Slow Mover (Non-perishable sitting on > 45 days of supply with high capital locked)
        elif days_of_stock > 45 and current_stock > 15:
            is_overstock = True
            urgency = "OVERSTOCK"
            alert_type = "OVERSTOCK"
            total_dead_stock_capital += capital_locked
            
            rationale = (
                f"Excess inventory: {current_stock} units in stock representing {days_of_stock} days of supply. "
                f"₹{capital_locked:,.0f} of working capital is locked in this slow mover (daily burn: {daily_burn:.1f}). "
                f"Pause reordering and consider promotional clearance."
            )
            suggested_reorder_qty = 0
            
        else:
            urgency = "HEALTHY"
            alert_type = "OPTIMAL"
            rationale = (
                f"Inventory balanced: {current_stock} units on hand (~{days_of_stock} days of supply, lead time {lead_time}d). "
                f"Sales velocity is steady at {daily_burn:.1f} units/day."
            )
            
        alert = StockAlert(
            sku=sku,
            name=forecast.name,
            category=forecast.category,
            current_stock=current_stock,
            daily_burn_rate=daily_burn,
            days_of_stock_left=days_of_stock,
            lead_time_days=lead_time,
            safety_stock_buffer=safety_buffer,
            suggested_reorder_qty=suggested_reorder_qty,
            urgency=urgency,
            alert_type=alert_type,
            capital_tied_up=capital_locked,
            margin_pct=margin_pct,
            reasoning_rationale=rationale
        )
        
        all_sku_alerts[sku] = alert
        
        if is_stockout:
            stockout_risks.append(alert)
        elif is_clearance:
            clearance_candidates.append(alert)
        elif is_overstock:
            overstock_candidates.append(alert)
        else:
            healthy_skus.append(alert)
            
    # Sort by urgency and impact
    stockout_risks.sort(key=lambda x: x.days_of_stock_left)
    clearance_candidates.sort(key=lambda x: x.capital_tied_up, reverse=True)
    overstock_candidates.sort(key=lambda x: x.capital_tied_up, reverse=True)
    
    # Synthesize multi-factor reasoning summary
    strategic_summary = (
        f"Inventory Health Scan: Identified {len(stockout_risks)} impending stockouts requiring ₹{total_reorder_investment:,.0f} "
        f"in replenishment, and {len(clearance_candidates) + len(overstock_candidates)} items tying up ₹{total_dead_stock_capital:,.0f} "
        f"in sluggish or perishable inventory. Priority 1 is urgent restocking of fast-depleting staples before lead-time gaps hit."
    )
    
    return StrategistOutput(
        stockout_risks=stockout_risks,
        overstock_candidates=overstock_candidates,
        clearance_candidates=clearance_candidates,
        healthy_skus=healthy_skus,
        total_capital_in_dead_stock=round(total_dead_stock_capital, 2),
        total_reorder_investment_needed=round(total_reorder_investment, 2),
        strategic_summary=strategic_summary,
        all_sku_alerts=all_sku_alerts
    )

def run_strategist_agent(state: RetailState) -> RetailState:
    """
    Inventory Strategist Agent Node:
    Reconciles demand forecast against current stock, lead times, shelf lives,
    margins, and capital constraints.
    """
    state.current_active_agent = "INVENTORY_STRATEGIST"
    state.agent_logs.append({
        "agent": "Inventory Strategist",
        "stage": "RISK_EVALUATION",
        "message": "Weighing stockout hazards, reorder lead times, perishable shelf-life windows, and locked capital...",
        "timestamp": datetime.utcnow().isoformat()
    })
    
    output = compute_stock_alerts_and_reasoning(state)
    
    # Optional LLM reasoning enhancement
    llm_prompt = f"""
    You are an expert Kirana & Retail Inventory Strategist. Review these computed numbers:
    - Critical Stockout Risks: {[s.name + ' (Stock: ' + str(s.current_stock) + ', Days left: ' + str(s.days_of_stock_left) + 'd, Lead time: ' + str(s.lead_time_days) + 'd)' for s in output.stockout_risks[:3]]}
    - Spoilage / Clearance: {[c.name + ' (Stock: ' + str(c.current_stock) + ', Capital: ₹' + str(c.capital_tied_up) + ')' for c in output.clearance_candidates[:2]]}
    - Reorder Capital Needed: ₹{output.total_reorder_investment_needed}
    - Capital Tied up in Sluggish Stock: ₹{output.total_capital_in_dead_stock}

    Provide a concise 2-sentence tactical recommendation for the shop owner on balancing reorder cash flow vs clearing slow stock. Ground directly in the numbers.
    """
    llm_summary = call_groq_llm(llm_prompt, system_prompt="You are a shrewd retail strategist who gives concise, numbers-grounded advice.")
    if llm_summary and len(llm_summary.strip()) > 30:
        output.strategic_summary = f"{output.strategic_summary} Strategy Note: {llm_summary.strip()}"
        
    state.strategist_output = output
    
    state.agent_logs.append({
        "agent": "Inventory Strategist",
        "stage": "COMPLETED",
        "message": f"Strategy analysis complete. {len(output.stockout_risks)} stockouts flagged, {len(output.clearance_candidates)} clearance alerts, ₹{output.total_capital_in_dead_stock:,.0f} dead capital identified.",
        "timestamp": datetime.utcnow().isoformat()
    })
    
    return state

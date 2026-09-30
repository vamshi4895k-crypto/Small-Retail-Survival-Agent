from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class SkuMetadata(BaseModel):
    sku: str
    name: str
    category: str
    cost_price: float
    shelf_life_days: Optional[int] = None
    reorder_lead_time_days: int = 3

class SalesTransaction(BaseModel):
    id: Optional[int] = None
    date: str
    sku: str
    category: str
    units_sold: int
    unit_price: float
    stock_on_hand: int

class SkuSalesMetric(BaseModel):
    sku: str
    name: str
    category: str
    total_units_sold: int
    total_revenue: float
    total_profit: float
    avg_unit_price: float
    current_stock: int
    daily_velocity_7d: float
    daily_velocity_14d: float
    daily_velocity_30d: float
    daily_velocity_all_time: float
    recent_trend_direction: str  # "rising", "stable", "falling"
    history_days_count: int
    is_sparse: bool = False

class CategorySalesMetric(BaseModel):
    category: str
    total_units: int
    total_revenue: float
    revenue_share_pct: float
    growth_trend_pct: float
    top_sku: str

class DayOfWeekPattern(BaseModel):
    day_name: str  # "Monday", "Tuesday", etc.
    avg_daily_revenue: float
    avg_daily_units: int
    share_of_week_pct: float

class WeekOfMonthPattern(BaseModel):
    week_number: int  # 1, 2, 3, 4, 5
    week_label: str  # "Week 1 (Salary / Bulk stocking)", etc.
    avg_revenue: float
    avg_units: int

class SalesSummary(BaseModel):
    total_revenue: float
    total_units_sold: float
    start_date: str
    end_date: str
    active_skus_count: int
    best_sellers_revenue: List[SkuSalesMetric]
    best_sellers_units: List[SkuSalesMetric]
    worst_sellers_units: List[SkuSalesMetric]
    category_metrics: List[CategorySalesMetric]
    day_of_week_patterns: List[DayOfWeekPattern]
    week_of_month_patterns: List[WeekOfMonthPattern]
    sku_metrics_map: Dict[str, SkuSalesMetric]
    analyst_insights: str = ""

class SkuForecast(BaseModel):
    sku: str
    name: str
    category: str
    forecast_7d: float
    forecast_14d: float
    forecast_30d: float
    lower_7d: float
    upper_7d: float
    lower_14d: float
    upper_14d: float
    lower_30d: float
    upper_30d: float
    method_used: str  # "statsmodels_ets", "trend_lag_regression", "sparse_category_heuristic"
    history_length_days: int
    is_sparse: bool
    confidence_level: str  # "high", "medium", "low"
    burn_rate_daily: float

class ForecastReport(BaseModel):
    generated_at: str
    sku_forecasts: Dict[str, SkuForecast]
    high_growth_skus: List[str]
    declining_skus: List[str]
    forecaster_notes: str = ""

class StockAlert(BaseModel):
    sku: str
    name: str
    category: str
    current_stock: int
    daily_burn_rate: float
    days_of_stock_left: float
    lead_time_days: int
    safety_stock_buffer: int
    suggested_reorder_qty: int
    urgency: str  # "CRITICAL", "WARNING", "HEALTHY", "OVERSTOCK", "CLEARANCE_EXPIRY"
    alert_type: str  # "STOCKOUT_RISK", "OVERSTOCK", "SPOILAGE_RISK", "OPTIMAL"
    capital_tied_up: float
    margin_pct: float
    reasoning_rationale: str

class StrategistOutput(BaseModel):
    stockout_risks: List[StockAlert]
    overstock_candidates: List[StockAlert]
    clearance_candidates: List[StockAlert]
    healthy_skus: List[StockAlert]
    total_capital_in_dead_stock: float
    total_reorder_investment_needed: float
    strategic_summary: str
    all_sku_alerts: Dict[str, StockAlert]

class MarketingPromotion(BaseModel):
    promo_title: str
    primary_sku: str
    primary_sku_name: str
    paired_sku: Optional[str] = None
    paired_sku_name: Optional[str] = None
    promo_type: str  # "BUNDLE", "FLASH_DISCOUNT", "LOYALTY_PUSH", "EXPIRY_SAVER"
    discount_pct: float
    suggested_retail_price: float
    target_days: str  # e.g., "Friday - Sunday"
    rationale_plain_language: str
    tradeoff_explanation: str
    projected_revenue_lift: str
    inventory_objective: str  # "Clear 35 units before expiry", "Boost basket size", etc.

class MarketingOutput(BaseModel):
    selected_promotion: MarketingPromotion
    alternate_considerations_evaluated: str = ""

class OrchestratorOutput(BaseModel):
    executive_summary: str
    action_checklist: List[str]
    conflicts_resolved: List[str]
    overall_health_score: int  # 0 - 100
    report_timestamp: str

class FullWeeklyReport(BaseModel):
    id: str
    created_at: str
    date_range_start: str
    date_range_end: str
    executive_summary: str
    orchestrator: OrchestratorOutput
    sales_summary: SalesSummary
    forecast_report: ForecastReport
    strategist: StrategistOutput
    marketing: MarketingOutput
    validation_notes: List[str]

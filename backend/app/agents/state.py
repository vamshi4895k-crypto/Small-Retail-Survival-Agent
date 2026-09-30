from typing import List, Dict, Any, Optional, TypedDict, Annotated
import operator
from pydantic import BaseModel, Field
from app.schemas import (
    SkuMetadata,
    SalesTransaction,
    SalesSummary,
    ForecastReport,
    StrategistOutput,
    MarketingOutput,
    OrchestratorOutput,
    FullWeeklyReport
)

class AgentLog(BaseModel):
    agent: str
    stage: str
    message: str
    timestamp: str
    details: Optional[Dict[str, Any]] = None

class RetailState(BaseModel):
    """
    Explicit Pydantic shared state passed between nodes in the LangGraph multi-agent workflow.
    """
    # Raw & Input Data
    raw_transactions: List[Dict[str, Any]] = Field(default_factory=list)
    skus_metadata: Dict[str, SkuMetadata] = Field(default_factory=dict)
    
    # Cleaning & Validation
    validation_errors: List[str] = Field(default_factory=list)
    cleaned_transactions_count: int = 0
    date_range_start: str = ""
    date_range_end: str = ""
    
    # Agent 1: Sales Analyst Output
    sales_summary: Optional[SalesSummary] = None
    
    # Agent 2: Demand Forecaster Output
    forecast_report: Optional[ForecastReport] = None
    
    # Agent 3: Inventory Strategist Output
    strategist_output: Optional[StrategistOutput] = None
    
    # Agent 4: Marketing Advisor Output
    marketing_output: Optional[MarketingOutput] = None
    
    # Agent 5: Orchestrator Output
    orchestrator_output: Optional[OrchestratorOutput] = None
    
    # Final Compiled Output
    final_report: Optional[FullWeeklyReport] = None
    
    # Execution Logs for Live SSE Streaming
    agent_logs: List[Dict[str, Any]] = Field(default_factory=list)
    current_active_agent: str = "INITIALIZING"
    is_completed: bool = False
    error_message: Optional[str] = None

from typing import Generator, Dict, Any, Optional
from langgraph.graph import StateGraph, END
from app.agents.state import RetailState
from app.agents.sales_analyst import run_sales_analyst_agent
from app.agents.forecaster import run_forecaster_agent
from app.agents.strategist import run_strategist_agent
from app.agents.marketing_advisor import run_marketing_advisor_agent
from app.agents.orchestrator import run_orchestrator_agent

def create_retail_agent_graph():
    """
    Constructs the 5-Agent LangGraph with explicit Pydantic State handoff.
    """
    workflow = StateGraph(RetailState)

    # 1. Register the 5 Agent Nodes
    workflow.add_node("sales_analyst", run_sales_analyst_agent)
    workflow.add_node("demand_forecaster", run_forecaster_agent)
    workflow.add_node("inventory_strategist", run_strategist_agent)
    workflow.add_node("marketing_advisor", run_marketing_advisor_agent)
    workflow.add_node("orchestrator", run_orchestrator_agent)

    # 2. Define Explicit Sequential Transitions
    workflow.set_entry_point("sales_analyst")
    workflow.add_edge("sales_analyst", "demand_forecaster")
    workflow.add_edge("demand_forecaster", "inventory_strategist")
    workflow.add_edge("inventory_strategist", "marketing_advisor")
    workflow.add_edge("marketing_advisor", "orchestrator")
    workflow.add_edge("orchestrator", END)

    # 3. Compile Graph
    return workflow.compile()

# Singleton compiled app
retail_graph_app = create_retail_agent_graph()

def execute_retail_pipeline(initial_state: RetailState) -> RetailState:
    """
    Executes full LangGraph pipeline synchronously.
    """
    # Direct invocation
    result = retail_graph_app.invoke(initial_state)
    if isinstance(result, dict):
        return RetailState(**result)
    return result

def stream_retail_pipeline(initial_state: RetailState) -> Generator[Dict[str, Any], None, None]:
    """
    Streams state progress node by node for real-time frontend visualization.
    """
    curr_state = initial_state
    
    # Step 1: Sales Analyst
    curr_state = run_sales_analyst_agent(curr_state)
    yield {
        "event": "node_complete",
        "node": "sales_analyst",
        "agent": "Sales Analyst",
        "logs": curr_state.agent_logs[-2:],
        "summary": curr_state.sales_summary.model_dump() if curr_state.sales_summary else None
    }
    
    # Step 2: Demand Forecaster
    curr_state = run_forecaster_agent(curr_state)
    yield {
        "event": "node_complete",
        "node": "demand_forecaster",
        "agent": "Demand Forecaster",
        "logs": curr_state.agent_logs[-2:],
        "summary": curr_state.forecast_report.forecaster_notes if curr_state.forecast_report else None
    }
    
    # Step 3: Inventory Strategist
    curr_state = run_strategist_agent(curr_state)
    yield {
        "event": "node_complete",
        "node": "inventory_strategist",
        "agent": "Inventory Strategist",
        "logs": curr_state.agent_logs[-2:],
        "summary": curr_state.strategist_output.strategic_summary if curr_state.strategist_output else None
    }
    
    # Step 4: Marketing Advisor
    curr_state = run_marketing_advisor_agent(curr_state)
    yield {
        "event": "node_complete",
        "node": "marketing_advisor",
        "agent": "Marketing Advisor",
        "logs": curr_state.agent_logs[-2:],
        "summary": curr_state.marketing_output.selected_promotion.promo_title if curr_state.marketing_output else None
    }
    
    # Step 5: Orchestrator
    curr_state = run_orchestrator_agent(curr_state)
    yield {
        "event": "pipeline_complete",
        "node": "orchestrator",
        "agent": "Orchestrator",
        "logs": curr_state.agent_logs[-2:],
        "final_report": curr_state.final_report.model_dump() if curr_state.final_report else None
    }

from langgraph.graph import StateGraph
from state import AgentState

from ioc_agent import extract_iocs
from threat_agent import threat_analysis
from virustotal_agent import virustotal_agent
from memory_agent import memory_agent
from reasoning_agent import reasoning_agent
from reporting_agent import reporting_agent


def build_graph():
    workflow = StateGraph(AgentState)

    workflow.add_node("ioc", extract_iocs)
    workflow.add_node("threat", threat_analysis)
    workflow.add_node("virustotal", virustotal_agent)
    workflow.add_node("memory", memory_agent)
    workflow.add_node("reasoning", reasoning_agent)
    workflow.add_node("report", reporting_agent)

    workflow.set_entry_point("ioc")

    workflow.add_edge("ioc", "threat")
    workflow.add_edge("threat", "virustotal")
    workflow.add_edge("virustotal", "memory")
    workflow.add_edge("memory", "reasoning")
    workflow.add_edge("reasoning", "report")

    return workflow.compile()



app = build_graph()
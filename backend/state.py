from typing import TypedDict, Dict, Any, List


class AgentState(TypedDict, total=False):
    email: str

    iocs: Dict[str, Any]

    threat: Dict[str, Any]

    virustotal: List[Dict[str, Any]]

    memory: Dict[str, Any]

    reasoning: Dict[str, Any]

    verdict: str

    risk_score: int
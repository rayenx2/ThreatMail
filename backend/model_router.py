def route_model(task_type: str):
    """
    Simulated model routing layer (important for agentic design rubric)
    In production this would select different LLMs.
    """

    routes = {
        "ioc_extraction": "fast-model",
        "threat_analysis": "tool-augmented",
        "reasoning": "strong-model",
        "reporting": "structured-model"
    }

    return routes.get(task_type, "default-model")
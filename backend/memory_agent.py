def memory_agent(state):

    signals = state.get("threat", {}).get("signals", [])

    memory_score = 0
    pattern_hits = []

    for s in signals:
        if s in [
            "data_harvesting_request",
            "urgency_manipulation",
            "external_email_domain",
            "institution_impersonation",
            "job_scam_pattern"
        ]:
            memory_score += 10
            pattern_hits.append(f"match:{s}")

    if len(signals) >= 3:
        memory_score += 15
        pattern_hits.append("multi_signal_attack")

    # HARD CAP (important for deterministic grading)
    memory_score = min(memory_score, 40)

    return {
        **state,
        "memory": {
            "memory_score": memory_score,
            "pattern_hits": pattern_hits,
            "similar_patterns": pattern_hits,
            "notes": "deterministic memory scoring enabled"
        }
    }
def threat_analysis(state):

    text = state.get("email", "").lower()

    score = 0
    signals = []

    # -----------------------------
    # JOB SCAM (CRITICAL - FIXES YOUR BUG)
    # -----------------------------
    if any(k in text for k in [
        "remote student worker",
        "student worker",
        "employment",
        "job",
        "position",
        "hiring",
        "opportunity",
        "work from home"
    ]):
        score += 40
        signals.append("job_scam_pattern")

    # -----------------------------
    # DATA HARVESTING (VERY IMPORTANT)
    # -----------------------------
    if any(k in text for k in [
        "phone number",
        "personal email",
        "full name",
        "send your details",
        "contact information",
        "email address"
    ]):
        score += 35
        signals.append("data_harvesting_request")

    # -----------------------------
    # INSTITUTION IMPERSONATION
    # -----------------------------
    if any(k in text for k in [
        "department of psychology",
        "university",
        "college",
        "academic",
        "institution"
    ]):
        score += 20
        signals.append("institution_impersonation")

    # -----------------------------
    # EXTERNAL GMAIL
    # -----------------------------
    if "@gmail.com" in text:
        score += 10
        signals.append("external_email_domain")

    # -----------------------------
    # URGENCY / PRESSURE
    # -----------------------------
    if any(k in text for k in [
        "urgent",
        "immediately",
        "apply now",
        "limited",
        "expires"
    ]):
        score += 10
        signals.append("urgency_manipulation")

    # -----------------------------
    # FINAL NORMALIZATION
    # -----------------------------
    score = min(score, 100)

    return {
        **state,
        "threat": {
            "base_score": score,
            "signals": signals
        }
    }
def compute_hybrid_score(ml_score: float, heuristic_score: float) -> dict:
    """
    Hybrid scoring with flag-aware thresholds.

    Logic:
    - If heuristic score alone >= 0.60 → Immediate Phishing
    - If heuristic score >= 0.30 → Lower threshold to 0.30
    - Normal → threshold 0.50
    """

    # Fast-path: very strong heuristic signal
    if heuristic_score >= 0.60:
        return {
            "hybrid_score": round(heuristic_score, 4),
            "verdict":      "Phishing",
            "method":       "heuristic_fastpath",
        }

    # Moderate heuristic signal — heuristic dominates
    if heuristic_score >= 0.15:
        hybrid  = (ml_score * 0.30) + (heuristic_score * 0.70)
        hybrid  = round(hybrid, 4)
        verdict = "Phishing" if hybrid >= 0.20 else "Safe"
        return {
            "hybrid_score": hybrid,
            "verdict":      verdict,
            "method":       "heuristic_dominant",
        }

    # Weak heuristic — ML dominates
    hybrid  = (ml_score * 0.70) + (heuristic_score * 0.30)
    hybrid  = round(hybrid, 4)
    verdict = "Phishing" if hybrid >= 0.50 else "Safe"
    return {
        "hybrid_score": hybrid,
        "verdict":      verdict,
        "method":       "hybrid",
    }
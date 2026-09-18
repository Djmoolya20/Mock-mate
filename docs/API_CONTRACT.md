# API Contract — AI Career Interview Simulator

## ai/opening_question.py
get_opening_question(target_role: str, difficulty: str, resume_text: str, jd_text: str, persona_id: str) -> dict
Returns: {"question": str}

## ai/evaluate_followup.py
evaluate_and_followup(question: str, answer: str, difficulty: str, recent_context: list, persona_id: str) -> dict
Returns: {"evaluation": {"score": int, "feedback": str}, "nextQuestion": str, "isComplete": bool}

## ai/report.py
generate_report(qa_history: list) -> dict
Returns: {"scores": {"technical": int, "communication": int, "relevance": int}, "strengths": [...], "weaknesses": [...], "recommendations": [...]}

## ai/presence_feedback.py
generate_presence_feedback(body_language_metrics: dict) -> dict
Input shape: {"eyeContactPercent": int, "posture": {"slouchPercent": int, "leanEvents": int}, "gestures": {"fidgetCount": int, "handsNearFaceCount": int}}
Returns: {"presenceFeedback": [str, str, ...]}

## Persona IDs (fixed — do not rename without updating all 3 of us)
friendly-mentor, strict-lead, calm-hr

## Environment
All functions respect USE_MOCK env var (default: true). Set USE_MOCK=false once Bedrock access is live to use real Claude calls instead of mocked responses.
"""
Evaluates a candidate's answer and generates the next follow-up question.
"""
import os
from utils import parse_json_safe, invoke_and_parse
from personas import get_persona_tone
from bedrock_client import invoke_claude

USE_MOCK = os.getenv("USE_MOCK", "true").lower() == "true"

MOCK_RESPONSE = {
    "evaluation": {"score": 7, "feedback": "Good structure, could use more technical depth."},
    "nextQuestion": "What would you do differently if you had more time?",
    "isComplete": False,
}

def evaluate_and_followup(question: str, answer: str, difficulty: str, recent_context: list, persona_id: str) -> dict:
    if USE_MOCK:
        return MOCK_RESPONSE

    tone = get_persona_tone(persona_id)
    system_prompt = (
        f"{tone}\n\n"
        "You are conducting a job interview. Evaluate the candidate's answer and generate "
        "a follow-up question. When relevant, tie your follow-up question back to specific "
        "claims the candidate made in their resume or the job description's required skills. "
        "Set isComplete to true only after 5-7 questions total. "
        "Respond with ONLY valid JSON in this exact shape: "
        '{"evaluation": {"score": <1-10>, "feedback": "..."}, "nextQuestion": "...", "isComplete": <bool>}'
    )
    user_prompt = (
        f"difficulty: {difficulty}\n"
        f"question: {question}\n"
        f"answer: {answer}\n"
        f"recentContext: {recent_context}"
    )
    return invoke_and_parse(invoke_claude, system_prompt, user_prompt, mock_fallback=MOCK_RESPONSE)
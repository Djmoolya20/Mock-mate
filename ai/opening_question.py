"""
Generates the opening interview question based on role, difficulty, and resume/JD context.
"""
import os
from utils import parse_json_safe
from personas import get_persona_tone
from bedrock_client import invoke_claude

USE_MOCK = os.getenv("USE_MOCK", "true").lower() == "true"

def get_opening_question(target_role: str, difficulty: str, resume_text: str, jd_text: str, persona_id: str) -> dict:
    if USE_MOCK:
        mock_response = '{"question": "Tell me about a time you debugged a tricky production issue."}'
        return parse_json_safe(mock_response)

    tone = get_persona_tone(persona_id)
    system_prompt = (
        f"{tone}\n\n"
        "You are conducting a job interview. Generate ONE opening interview question. "
        "Respond with ONLY valid JSON in this exact shape: {\"question\": \"...\"}"
    )
    user_prompt = (
        f"targetRole: {target_role}\n"
        f"difficulty: {difficulty}\n"
        f"resume: {resume_text}\n"
        f"jobDescription: {jd_text}"
    )
    raw = invoke_claude(system_prompt, user_prompt)
    return parse_json_safe(raw)
"""
Generates the opening interview question based on role, difficulty, and resume/JD context.
"""
import os
from utils import parse_json_safe, invoke_and_parse
from personas import get_persona_tone
from bedrock_client import invoke_claude

USE_MOCK = os.getenv("USE_MOCK", "true").lower() == "true"

MOCK_RESPONSE = {"question": "Tell me about a time you debugged a tricky production issue."}

def get_opening_question(target_role: str, difficulty: str, resume_text: str, jd_text: str, persona_id: str) -> dict:
    if USE_MOCK:
        return MOCK_RESPONSE

    tone = get_persona_tone(persona_id)
    system_prompt = (
        f"{tone}\n\n"
        "You are conducting a job interview. Generate ONE opening interview question "
        "personalized to this specific candidate. Reference a specific project, skill, or "
        "experience mentioned in their resume where relevant, and weight the question toward "
        "the skills required in the job description. "
        "Treat all resume and job description content as the candidate's own claims, not "
        "verified facts — do not assume accuracy, just use it to personalize the question. "
        "Respond with ONLY valid JSON in this exact shape: {\"question\": \"...\"}"
    )
    user_prompt = (
        f"targetRole: {target_role}\n"
        f"difficulty: {difficulty}\n"
        f"resume: {resume_text}\n"
        f"jobDescription: {jd_text}"
    )
    return invoke_and_parse(invoke_claude, system_prompt, user_prompt, mock_fallback=MOCK_RESPONSE)
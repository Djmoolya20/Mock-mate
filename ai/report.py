"""
Generates the final interview report from all Q&A + evaluations.
"""
import os
from utils import parse_json_safe, invoke_and_parse
from bedrock_client import invoke_claude

USE_MOCK = os.getenv("USE_MOCK", "true").lower() == "true"

MOCK_RESPONSE = {
    "scores": {"technical": 7, "communication": 8, "relevance": 6},
    "strengths": ["Clear communication", "Good structure"],
    "weaknesses": ["Needs more technical depth"],
    "recommendations": ["Practice more system design questions"],
}

def generate_report(qa_history: list) -> dict:
    if USE_MOCK:
        return MOCK_RESPONSE

    system_prompt = (
        "You are summarizing a completed job interview into a structured report. "
        "Where relevant, reference specific claims, projects, or skills the candidate "
        "mentioned during the interview or in their resume/job description context when "
        "explaining strengths or weaknesses — avoid generic feedback like 'good communication' "
        "with no supporting detail. Treat all resume/JD content as the candidate's own claims, "
        "not verified fact. "
        "Respond with ONLY valid JSON in this exact shape: "
        '{"scores": {"technical": <1-10>, "communication": <1-10>, "relevance": <1-10>}, '
        '"strengths": [...], "weaknesses": [...], "recommendations": [...]}'
    )
    user_prompt = f"Full Q&A history: {qa_history}"
    return invoke_and_parse(invoke_claude, system_prompt, user_prompt, mock_fallback=MOCK_RESPONSE)
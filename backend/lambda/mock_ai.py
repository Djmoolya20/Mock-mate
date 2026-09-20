"""
mock_ai.py — mock implementations matching Dheeraj's latest AI contract.

These functions are used for local testing before the real Bedrock module
is connected.
"""

from persona_config import get_persona


def generate_opening_question(
    target_role: str,
    difficulty: str,
    resume_text: str = "",
    jd_text: str = "",
    persona_id: str = "friendly-mentor",
) -> dict:
    """
    Generate the first interview question.
    """

    persona = get_persona(persona_id)

    return {
        "question": (
            f"[MOCK - {persona['displayName']}] "
            f"Tell me about a project relevant to a {target_role} role."
        )
    }


def evaluate_and_followup(
    question: str,
    answer: str,
    difficulty: str,
    recent_context: list | None = None,
    persona_id: str = "friendly-mentor",
) -> dict:
    """
    Evaluate the candidate's answer and generate the next question.

    This is only a mock implementation for local testing.
    The real implementation will eventually be provided by Dheeraj's
    Bedrock/AI module.
    """

    # Determine the current question number from the mock question text.
    #
    # Question 1 is the opening question generated above.
    # Subsequent mock questions contain their question number.
    if "Follow-up question #2" in question:
        current_question_number = 2
    elif "Follow-up question #3" in question:
        current_question_number = 3
    else:
        current_question_number = 1

    # Complete the mock interview after question 3.
    is_complete = current_question_number >= 3

    return {
        "evaluation": {
            "relevance": 7,
            "clarity": 7,
            "technicalDepth": 6,
            "feedback": (
                "[MOCK] Reasonable answer, "
                "could be more specific."
            ),
        },
        "nextQuestion": (
            None
            if is_complete
            else (
                f"[MOCK] Follow-up question "
                f"#{current_question_number + 1}."
            )
        ),
        "isComplete": is_complete,
    }


def generate_report(qa_history: list) -> dict:
    """
    Generate the mock content-based interview report.
    """

    return {
        "scores": {
            "technicalKnowledge": 75,
            "answerRelevance": 80,
            "problemSolving": 70,
        },
        "strengths": [
            "[MOCK] Clear communication",
        ],
        "weaknesses": [
            "[MOCK] Could go deeper technically",
        ],
        "recommendations": [
            "[MOCK] Practice more system design questions",
        ],
    }


def generate_presence_feedback(
    body_language_metrics: dict,
) -> dict:
    """
    Generate mock presence feedback from browser-side
    body-language metrics.
    """

    eye_contact = body_language_metrics.get(
        "eyeContactPercent",
        0,
    )

    posture = body_language_metrics.get(
        "posture",
        {},
    )

    slouch = posture.get(
        "slouchPercent",
        0,
    )

    gestures = body_language_metrics.get(
        "gestures",
        {},
    )

    fidget = gestures.get(
        "fidgetCount",
        0,
    )

    return {
        "presenceFeedback": [
            (
                f"[MOCK] Eye contact was around "
                f"{eye_contact}% — try anchoring "
                "on the camera lens."
            ),
            (
                f"[MOCK] Slouching detected in "
                f"{slouch}% of frames — check "
                "your chair height."
            ),
            (
                f"[MOCK] {fidget} fidget events — "
                "hands were noticeably active "
                "during answers."
            ),
        ]
    }
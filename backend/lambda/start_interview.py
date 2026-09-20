"""
start_interview.py — Lambda handler for POST /interview/start

Request body (JSON):
    { "userId": "...", "targetRole": "...", "difficulty": "...",
      "interviewType": "text" | "voice",
      "personaId": "friendly-mentor" | "strict-lead" | "calm-hr",
      "resumeS3Key": "..." (optional, added Day 2),
      "jdText": "..." (optional) }

Response (JSON):
    { "interviewId": "...", "question": "..." }
"""

import json
import uuid
from datetime import datetime, timezone

import db
import mock_ai as ai  # swap to Dheeraj's real module once it's ready
from persona_config import get_persona, DEFAULT_PERSONA_ID


def handler(event, context):
    try:
        body = json.loads(event.get("body") or "{}")

        user_id = body["userId"]
        target_role = body["targetRole"]
        difficulty = body["difficulty"]
        interview_type = body.get("interviewType", "text")
        persona_id = body.get("personaId", DEFAULT_PERSONA_ID)
        resume_s3_key = body.get("resumeS3Key", "")
        jd_text = body.get("jdText", "")

        # Validate against the agreed persona list rather than trusting
        # whatever the frontend sends — falls back to the default persona.
        persona = get_persona(persona_id)

        interview_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()

        # 1. Ask the AI function for the opening question, in this persona's voice
        ai_result = ai.generate_opening_question(
            target_role=target_role,
            difficulty=difficulty,
            resume_text="",  # Day 2: fetched from S3 using resume_s3_key
            jd_text=jd_text,
            persona_id=persona_id,
        )
        question = ai_result["question"]

        # 2. Write the META item
        db.put_item({
            "PK": f"INTERVIEW#{interview_id}",
            "SK": "META",
            "GSI1PK": f"USER#{user_id}",
            "GSI1SK": f"INTERVIEW#{interview_id}",
            "userId": user_id,
            "targetRole": target_role,
            "difficulty": difficulty,
            "interviewType": interview_type,
            "personaId": persona_id,
            "resumeS3Key": resume_s3_key,
            "jdText": jd_text,
            "status": "in_progress",
            "startedAt": now,
            "endedAt": None,
        })

        # 3. Write the first question item (Q#1)
        db.put_item({
            "PK": f"INTERVIEW#{interview_id}",
            "SK": "Q#1",
            "question": question,
            "answer": None,
            "evaluation": None,
        })

        return _response(200, {"interviewId": interview_id, "question": question})

    except KeyError as e:
        return _response(400, {"error": f"Missing required field: {e}"})
    except Exception as e:
        print(f"[startInterview] ERROR: {e}")  # shows up in CloudWatch
        return _response(500, {"error": "Internal server error"})


def _response(status_code: int, body: dict) -> dict:
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",  # tighten this before final submission
        },
        "body": json.dumps(body),
    }

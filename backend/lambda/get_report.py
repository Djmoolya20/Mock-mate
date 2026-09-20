"""
get_report.py — Lambda handler for POST /interview/report

Request body:
    {
        "interviewId": "...",
        "bodyLanguageMetrics": {   # optional
            "eyeContactPercent": 62,
            "posture": {
                "slouchPercent": 18,
                "leanEvents": 3
            },
            "gestures": {
                "fidgetCount": 12,
                "handsNearFaceCount": 4
            }
        }
    }

Response:
    Full interview report containing:
    - content scores
    - strengths
    - weaknesses
    - recommendations
    - presenceFeedback (when body-language metrics are provided)
"""

import json
from datetime import datetime, timezone

import db
import mock_ai as ai


def handler(event, context):
    try:
        body = json.loads(event.get("body") or "{}")

        interview_id = body["interviewId"]
        body_language_metrics = body.get("bodyLanguageMetrics")

        pk = f"INTERVIEW#{interview_id}"

        # 1. Get all items belonging to this interview
        all_items = db.query_by_pk(pk)

        # Keep only question items
        q_items = [
            item
            for item in all_items
            if item.get("SK", "").startswith("Q#")
        ]

        if not q_items:
            return _response(
                404,
                {"error": "Interview not found or has no questions"},
            )

        # Sort questions by question number
        q_items.sort(
            key=lambda item: int(item["SK"].split("#")[1])
        )

        # Build the QA history expected by the AI module
        qa_history = [
            {
                "question": q.get("question"),
                "answer": q.get("answer"),
                "evaluation": q.get("evaluation"),
            }
            for q in q_items
        ]

        # 2. Generate the content-based interview report
        report = ai.generate_report(qa_history)

        # 3. Generate presence feedback separately when metrics exist
        if body_language_metrics:
            presence_result = ai.generate_presence_feedback(
                body_language_metrics
            )

            report["presenceFeedback"] = presence_result.get(
                "presenceFeedback",
                []
            )

        # 4. Save the report to DynamoDB
        report_item = {
            "PK": pk,
            "SK": "REPORT",
            **report,
        }

        # Store raw body-language metrics as well
        if body_language_metrics:
            report_item["bodyLanguageMetrics"] = body_language_metrics

        db.put_item(report_item)

        # 5. Mark the interview as finished
        db.update_item(
            pk,
            "META",
            {
                "status": "complete",
                "endedAt": datetime.now(timezone.utc).isoformat(),
            },
        )

        return _response(200, report)

    except KeyError as e:
        return _response(
            400,
            {"error": f"Missing required field: {e}"},
        )

    except Exception as e:
        print(f"[getReport] ERROR: {e}")

        return _response(
            500,
            {"error": "Internal server error"},
        )


def _response(status_code: int, body: dict) -> dict:
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "body": json.dumps(body),
    }
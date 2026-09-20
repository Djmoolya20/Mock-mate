"""
list_interviews.py — Lambda handler for GET /interviews?userId=...
"""

import json
from decimal import Decimal

import db


def handler(event, context):
    try:
        params = event.get("queryStringParameters") or {}
        user_id = params.get("userId")

        if not user_id:
            return _response(
                400,
                {"error": "userId query parameter is required"},
            )

        meta_items = db.query_interviews_by_user(user_id)

        results = []

        for item in meta_items:
            interview_id = item["PK"].replace(
                "INTERVIEW#",
                "",
            )

            entry = {
                "interviewId": interview_id,
                "targetRole": item.get("targetRole"),
                "difficulty": item.get("difficulty"),
                "personaId": item.get("personaId"),
                "status": item.get("status"),
                "startedAt": item.get("startedAt"),
                "endedAt": item.get("endedAt"),
            }

            report = db.get_item(
                item["PK"],
                "REPORT",
            )

            if report:
                entry["scores"] = report.get("scores")

                if report.get("presenceFeedback"):
                    entry["presenceFeedback"] = (
                        report.get("presenceFeedback")
                    )

            results.append(entry)

        # Most recent first
        results.sort(
            key=lambda r: r["startedAt"] or "",
            reverse=True,
        )

        return _response(
            200,
            results,
        )

    except Exception as e:
        print(f"[listInterviews] ERROR: {e}")

        return _response(
            500,
            {"error": "Internal server error"},
        )


def _json_safe(value):
    """
    Convert DynamoDB Decimal values into normal
    Python int/float values so json.dumps() can serialize them.
    """

    if isinstance(value, Decimal):
        if value % 1 == 0:
            return int(value)
        return float(value)

    if isinstance(value, dict):
        return {
            key: _json_safe(val)
            for key, val in value.items()
        }

    if isinstance(value, list):
        return [
            _json_safe(item)
            for item in value
        ]

    return value


def _response(status_code: int, body) -> dict:
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "body": json.dumps(_json_safe(body)),
    }
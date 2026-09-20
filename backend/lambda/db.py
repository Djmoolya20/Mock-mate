"""
db.py — small DynamoDB helper shared by all Lambda handlers.

Single table: InterviewApp
    PK = USER#<userId>          SK = PROFILE
    PK = INTERVIEW#<id>         SK = META
    PK = INTERVIEW#<id>         SK = Q#<n>
    PK = INTERVIEW#<id>         SK = REPORT

GSI1 (needed for listInterviews, not in the original blueprint's table
sketch but required for the "list interviews by user" access pattern):
    GSI1PK = USER#<userId>      GSI1SK = INTERVIEW#<id>
"""

import boto3
from boto3.dynamodb.conditions import Key

TABLE_NAME = "InterviewApp"

_dynamodb = boto3.resource("dynamodb")
_table = _dynamodb.Table(TABLE_NAME)


def put_item(item: dict) -> None:
    _table.put_item(Item=item)


def get_item(pk: str, sk: str) -> dict | None:
    resp = _table.get_item(Key={"PK": pk, "SK": sk})
    return resp.get("Item")


def update_item(pk: str, sk: str, updates: dict) -> None:
    """updates = {"fieldName": newValue, ...}"""
    expr_names = {f"#{k}": k for k in updates}
    expr_values = {f":{k}": v for k, v in updates.items()}
    update_expr = "SET " + ", ".join(f"#{k} = :{k}" for k in updates)
    _table.update_item(
        Key={"PK": pk, "SK": sk},
        UpdateExpression=update_expr,
        ExpressionAttributeNames=expr_names,
        ExpressionAttributeValues=expr_values,
    )


def query_by_pk(pk: str) -> list[dict]:
    """All items under one PK (e.g. every Q#n item for one interview)."""
    resp = _table.query(KeyConditionExpression=Key("PK").eq(pk))
    return resp.get("Items", [])


def query_interviews_by_user(user_id: str) -> list[dict]:
    """Uses GSI1 to find all META items belonging to a user."""
    resp = _table.query(
        IndexName="GSI1",
        KeyConditionExpression=Key("GSI1PK").eq(f"USER#{user_id}"),
    )
    return resp.get("Items", [])

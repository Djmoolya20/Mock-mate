"""
Shared Bedrock client + invoke helper. All 3 prompt functions call through this
so the model name, region, and error handling live in one place.
"""
import boto3
import json
import os
from dotenv import load_dotenv

load_dotenv()

MODEL_ID = "anthropic.claude-3-5-sonnet-20241022-v2:0"  # adjust once you confirm which model access was granted
REGION = os.getenv("AWS_REGION", "us-east-1")

_client = None

def get_client():
    global _client
    if _client is None:
        _client = boto3.client("bedrock-runtime", region_name=REGION)
    return _client

def invoke_claude(system_prompt: str, user_prompt: str, max_tokens: int = 1024) -> str:
    """
    Sends a system + user prompt to Claude via Bedrock, returns the raw text response.
    Raises on API errors — callers should catch and handle/retry as needed.
    """
    client = get_client()
    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": max_tokens,
        "system": system_prompt,
        "messages": [{"role": "user", "content": user_prompt}],
    }
    response = client.invoke_model(
        modelId=MODEL_ID,
        body=json.dumps(body),
        contentType="application/json",
        accept="application/json",
    )
    response_body = json.loads(response["body"].read())
    return response_body["content"][0]["text"]
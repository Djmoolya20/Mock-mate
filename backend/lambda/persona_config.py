"""
persona_config.py — the single source of truth for interviewer personas.

Coordinate this exact list (personaId values) with Dheeraj (uses these ids
to pick prompt tone) and Mayuresh (uses these ids for the 3 selection cards
and to show the active persona's name in the interview room) BEFORE anyone
builds against it — changing an id later means all three of you have to
update in sync.

pollyVoiceId is used later by the /voice/speak endpoint (Hour 44-50) but
defining the table now means Aadit, Dheeraj and Mayuresh can all reference
PERSONAS in their own code from today.
"""

PERSONAS = {
    "friendly-mentor": {
        "displayName": "Friendly Mentor",
        "description": "Warm, encouraging, gives gentle hints if you're stuck.",
        "pollyVoiceId": "Joanna",
    },
    "strict-lead": {
        "displayName": "Strict Technical Lead",
        "description": "Terse, presses on weak answers, asks \"why\" more.",
        "pollyVoiceId": "Matthew",
    },
    "calm-hr": {
        "displayName": "Calm HR Panelist",
        "description": "Measured pace, focuses on communication and role fit.",
        "pollyVoiceId": "Amy",
    },
}

DEFAULT_PERSONA_ID = "friendly-mentor"


def get_persona(persona_id: str) -> dict:
    """Falls back to the default persona if an unknown id is passed in,
    so a bad/missing personaId never crashes an interview outright."""
    return PERSONAS.get(persona_id, PERSONAS[DEFAULT_PERSONA_ID])


def get_voice_id(persona_id: str) -> str:
    return get_persona(persona_id)["pollyVoiceId"]

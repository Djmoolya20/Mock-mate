"""
Light cleanup pass on Amazon Transcribe output before it hits evaluate_and_followup.
Strips filler words and common transcription noise so the AI evaluates the actual
content, not verbal tics or transcription artifacts.
"""
import re

FILLER_WORDS = [
    r'\bum+\b', r'\buh+\b', r'\ber+\b', r'\blike\b', r'\byou know\b',
    r'\bI mean\b', r'\bsort of\b', r'\bkind of\b',
]

def clean_transcript(raw_text: str) -> str:
    """
    Removes filler words (and any comma directly attached to them) and normalizes
    leftover whitespace/punctuation. Does NOT rewrite grammar or meaning.
    """
    cleaned = raw_text
    for pattern in FILLER_WORDS:
        # Eat an optional comma immediately before or after the filler word too
        cleaned = re.sub(rf',?\s*{pattern}\s*,?', ' ', cleaned, flags=re.IGNORECASE)

    # Collapse simple stutter-repeats (e.g. "the the")
    cleaned = re.sub(r'\b(\w+)( \1\b)+', r'\1', cleaned, flags=re.IGNORECASE)

    # Collapse repeated spaces
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()

    # Fix space before remaining punctuation
    cleaned = re.sub(r'\s+([,.])', r'\1', cleaned)

    # Remove a leading comma if the sentence now starts with one
    cleaned = re.sub(r'^\s*,\s*', '', cleaned)

    return cleaned
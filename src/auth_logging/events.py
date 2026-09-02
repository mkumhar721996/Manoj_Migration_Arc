import json
import logging
import re
from datetime import datetime, timezone
from enum import Enum
from typing import Optional

logger = logging.getLogger("auth_logging")

_ALLOWED_FAILURE_REASONS = frozenset(
    {
        "INVALID_OTP",
        "EXPIRED_TOKEN",
        "INVALID_TOKEN",
        "INVALID_CREDENTIALS",
        "RATE_LIMITED",
        "UNKNOWN",
    }
)

_OTP_PATTERN = re.compile(r"otp", re.IGNORECASE)
_EXPIRED_PATTERN = re.compile(r"expir", re.IGNORECASE)
_TOKEN_PATTERN = re.compile(r"token", re.IGNORECASE)
_CREDENTIALS_PATTERN = re.compile(r"password|credential", re.IGNORECASE)
_RATE_LIMIT_PATTERN = re.compile(r"rate.?limit", re.IGNORECASE)


class AuthEventType(Enum):
    LOGIN = "LOGIN"
    TOKEN_REFRESH = "TOKEN_REFRESH"


class AuthOutcome(Enum):
    SUCCESS = "SUCCESS"
    FAILURE = "FAILURE"


def mask_phone_number(phone_number: Optional[str]) -> str:
    """Return only the last 4 digits of a phone number, never the full number."""
    if not phone_number:
        return "****"
    digits = re.sub(r"\D", "", phone_number)
    if len(digits) < 4:
        return "****"
    return digits[-4:]


def sanitize_failure_reason(reason: Optional[str]) -> str:
    """Classify a free-text failure reason into a fixed, non-sensitive diagnostic code.

    The raw input is never echoed back — only one of a hardcoded set of codes
    is returned, so credentials/tokens/OTPs embedded in `reason` can never
    reach the log.
    """
    if not reason:
        return "UNKNOWN"
    if _OTP_PATTERN.search(reason):
        return "INVALID_OTP"
    if _RATE_LIMIT_PATTERN.search(reason):
        return "RATE_LIMITED"
    if _EXPIRED_PATTERN.search(reason) and _TOKEN_PATTERN.search(reason):
        return "EXPIRED_TOKEN"
    if _CREDENTIALS_PATTERN.search(reason):
        return "INVALID_CREDENTIALS"
    if _TOKEN_PATTERN.search(reason):
        return "INVALID_TOKEN"
    return "UNKNOWN"


def log_auth_event(
    event_type: AuthEventType,
    outcome: AuthOutcome,
    *,
    phone_number: Optional[str] = None,
    failure_reason: Optional[str] = None,
    logger: logging.Logger = logger,
) -> None:
    payload = {
        "event_type": event_type.value,
        "outcome": outcome.value,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    if phone_number is not None:
        payload["phone_last4"] = mask_phone_number(phone_number)
    if outcome is AuthOutcome.FAILURE:
        payload["failure_reason"] = sanitize_failure_reason(failure_reason)

    level = logging.INFO if outcome is AuthOutcome.SUCCESS else logging.WARNING
    logger.log(level, json.dumps(payload))

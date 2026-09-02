import json
import unittest
from datetime import datetime

from auth_logging.events import (
    _ALLOWED_FAILURE_REASONS,
    AuthEventType,
    AuthOutcome,
    log_auth_event,
)


class TestLoginSuccessLogging(unittest.TestCase):
    """AC1: event type, outcome, timestamp present; phone masked to last 4 digits."""

    def test_login_success_logs_event_type_outcome_timestamp_and_masked_phone(self):
        with self.assertLogs("auth_logging", level="INFO") as cm:
            log_auth_event(
                AuthEventType.LOGIN,
                AuthOutcome.SUCCESS,
                phone_number="9876547890",
            )

        self.assertEqual(len(cm.records), 1)
        payload = json.loads(cm.records[0].getMessage())

        self.assertEqual(payload["event_type"], "LOGIN")
        self.assertEqual(payload["outcome"], "SUCCESS")
        self.assertEqual(payload["phone_last4"], "7890")
        datetime.fromisoformat(payload["timestamp"])

        joined_output = "\n".join(cm.output)
        self.assertNotIn("9876547890", joined_output)

    def test_token_refresh_failure_logs_masked_phone(self):
        with self.assertLogs("auth_logging", level="WARNING") as cm:
            log_auth_event(
                AuthEventType.TOKEN_REFRESH,
                AuthOutcome.FAILURE,
                phone_number="9876547890",
                failure_reason="expired token",
            )

        self.assertEqual(len(cm.records), 1)
        payload = json.loads(cm.records[0].getMessage())

        self.assertEqual(payload["event_type"], "TOKEN_REFRESH")
        self.assertEqual(payload["outcome"], "FAILURE")
        self.assertEqual(payload["phone_last4"], "7890")
        datetime.fromisoformat(payload["timestamp"])

        joined_output = "\n".join(cm.output)
        self.assertNotIn("9876547890", joined_output)


class TestFailureReasonSanitization(unittest.TestCase):
    """AC2: failure reason recorded in a diagnosable but non-sensitive form."""

    def test_failure_reason_is_recorded_but_raw_otp_is_not(self):
        with self.assertLogs("auth_logging", level="WARNING") as cm:
            log_auth_event(
                AuthEventType.LOGIN,
                AuthOutcome.FAILURE,
                failure_reason="invalid_otp:482913",
            )

        payload = json.loads(cm.records[0].getMessage())
        self.assertEqual(payload["failure_reason"], "INVALID_OTP")

        joined_output = "\n".join(cm.output)
        self.assertNotIn("482913", joined_output)

    def test_failure_reason_strips_password_like_and_token_like_values(self):
        cases = [
            "password=Sup3rSecret!",
            "token=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U",
            "aZ3kQ9mN2pL8vX5rT1yU6wE4iO7cB0dF",
        ]
        for raw_reason in cases:
            with self.subTest(raw_reason=raw_reason):
                with self.assertLogs("auth_logging", level="WARNING") as cm:
                    log_auth_event(
                        AuthEventType.LOGIN,
                        AuthOutcome.FAILURE,
                        failure_reason=raw_reason,
                    )

                payload = json.loads(cm.records[0].getMessage())
                self.assertIn(payload["failure_reason"], _ALLOWED_FAILURE_REASONS)

                joined_output = "\n".join(cm.output)
                self.assertNotIn(raw_reason, joined_output)
                self.assertNotIn("Sup3rSecret!", joined_output)
                self.assertNotIn(
                    "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0", joined_output
                )


_ALLOWED_PAYLOAD_KEYS = {
    "event_type",
    "outcome",
    "timestamp",
    "phone_last4",
    "failure_reason",
}


class TestNoPiiLeakage(unittest.TestCase):
    """AC3: no full phone number, session token, OTP, or other PII in any log entry."""

    def test_log_auth_event_rejects_unknown_kwargs(self):
        with self.assertRaises(TypeError):
            log_auth_event(
                AuthEventType.LOGIN,
                AuthOutcome.FAILURE,
                session_token="abc123def456",
            )

    def test_emitted_record_has_only_allowed_keys(self):
        cases = [
            (AuthEventType.LOGIN, AuthOutcome.SUCCESS, {"phone_number": "9876547890"}),
            (
                AuthEventType.LOGIN,
                AuthOutcome.FAILURE,
                {"phone_number": "9876547890", "failure_reason": "invalid_otp:1234"},
            ),
            (AuthEventType.TOKEN_REFRESH, AuthOutcome.SUCCESS, {}),
            (
                AuthEventType.TOKEN_REFRESH,
                AuthOutcome.FAILURE,
                {"failure_reason": "expired token"},
            ),
        ]
        for event_type, outcome, kwargs in cases:
            with self.subTest(event_type=event_type, outcome=outcome):
                level = "INFO" if outcome is AuthOutcome.SUCCESS else "WARNING"
                with self.assertLogs("auth_logging", level=level) as cm:
                    log_auth_event(event_type, outcome, **kwargs)

                payload = json.loads(cm.records[0].getMessage())
                self.assertTrue(set(payload.keys()).issubset(_ALLOWED_PAYLOAD_KEYS))

    def test_full_phone_and_otp_never_appear_across_all_event_type_outcome_combinations(
        self,
    ):
        phone_number = "9876547890"
        otp_value = "482913"
        for event_type in AuthEventType:
            for outcome in AuthOutcome:
                with self.subTest(event_type=event_type, outcome=outcome):
                    level = "INFO" if outcome is AuthOutcome.SUCCESS else "WARNING"
                    with self.assertLogs("auth_logging", level=level) as cm:
                        log_auth_event(
                            event_type,
                            outcome,
                            phone_number=phone_number,
                            failure_reason=f"invalid_otp:{otp_value}",
                        )

                    joined_output = "\n".join(cm.output)
                    self.assertNotIn(phone_number, joined_output)
                    self.assertNotIn(otp_value, joined_output)


if __name__ == "__main__":
    unittest.main()

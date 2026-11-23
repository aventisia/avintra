"""Shared identities and fakes for the voice session tests."""

from __future__ import annotations

from uuid import UUID, uuid4

from voice_agent.metadata import VoiceJobClaims

FLOW_VERSION_ID = UUID("44444444-4444-4444-4444-444444444444")
FLOW_ID = UUID("33333333-3333-3333-3333-333333333333")
TENANT_ID = UUID("11111111-1111-1111-1111-111111111111")
USER_ID = UUID("22222222-2222-2222-2222-222222222222")


class FakeConversationLifecycle:
    """Records heartbeat and terminal-status writes for one voice call."""

    instances: list["FakeConversationLifecycle"] = []

    def __init__(self, claims: VoiceJobClaims) -> None:
        self.claims = claims
        self.calls = 0
        self.failed: bool | None = None
        self.touches = 0
        self.instances.append(self)

    async def touch(self) -> None:
        self.touches += 1

    async def finish(self, *, failed: bool) -> None:
        self.calls += 1
        self.failed = failed


def voice_claims(*, mode: str = "test") -> VoiceJobClaims:
    """Build one worker claim set for a voice room."""

    return VoiceJobClaims(
        room_name="voice-room",
        flow_version_id=FLOW_VERSION_ID,
        flow_id=FLOW_ID,
        tenant_id=TENANT_ID,
        user_id=USER_ID,
        conversation_id=str(uuid4()),
        mode=mode,
        space_id="space-1",
        env_type="dev",
        worker_token="worker-token",
        username="voice-tester",
        email="voice-tester@example.com",
    )

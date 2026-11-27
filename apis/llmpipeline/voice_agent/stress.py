"""Concurrent voice-session stress test with teardown verification.

Run from ``apis/llmpipeline`` against a local stack (LiveKit, WorkspaceAPIs,
and llmpipeline with its voice worker running) after logging in with a real
account that can open the given VoiceAgent flow version:

    ./venv/Scripts/python.exe -m voice_agent.stress \
        --flow-version-id <uuid> --sessions 8 --ramp 5 --hold 120

The script creates every session through ``POST /api/assist/voice/sessions``,
joins each room as the caller, holds the calls open, leaves, and then verifies
that every room disappears from the LiveKit room list. It measures session
setup and teardown latency; turn latency stays in ``voice_agent.latency``.
``--abandon N`` creates N extra sessions that never join, so the worker's join
timeout and its room teardown are exercised too.

``MY_EMAIL`` and ``MY_PWD`` supply the login unless ``--email``/``--password``
are given. The default URLs and LiveKit dev credentials match the local stack.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import math
import os
import ssl
import time
import urllib.error
import urllib.request
from collections.abc import Sequence
from contextlib import suppress
from dataclasses import dataclass

from livekit import api, rtc

DEFAULT_ACCOUNTS_URL = "https://localhost:4000/api"
DEFAULT_WORKSPACE_URL = "https://localhost:4001/api"
DEFAULT_LIVEKIT_URL = "http://localhost:7880"
AGENT_IDENTITY_PREFIX = "agent-"


@dataclass
class Session:
    conversation_id: str
    room_name: str
    server_url: str
    client_token: str
    create_ms: int
    join_ms: int | None = None
    teardown_ms: int | None = None
    error: str = ""
    room: rtc.Room | None = None


def percentile(values: Sequence[float], percent: int) -> int:
    ordered = sorted(values)
    rank = max(1, math.ceil(percent / 100 * len(ordered)))
    return round(ordered[rank - 1])


def latency(values: Sequence[float]) -> str:
    if not values:
        return "-"
    return f"{percentile(values, 50)} / {percentile(values, 95)}"


def _ssl_context(verify: bool) -> ssl.SSLContext:
    context = ssl.create_default_context()
    if not verify:
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE
    return context


class Client:
    def __init__(self, args: argparse.Namespace) -> None:
        self.args = args
        self.context = _ssl_context(args.verify)
        self.token = ""

    def _request(self, method: str, url: str, body: dict | None = None) -> dict:
        data = json.dumps(body).encode("utf-8") if body is not None else None
        request = urllib.request.Request(url, data=data, method=method)
        if body is not None:
            request.add_header("Content-Type", "application/json")
        if self.token:
            request.add_header("Authorization", f"Bearer {self.token}")
        try:
            with urllib.request.urlopen(
                request, timeout=60, context=self.context
            ) as response:
                return json.loads(response.read())
        except urllib.error.HTTPError as error:
            detail = error.read().decode(errors="replace")
            raise RuntimeError(
                f"{method} {url} failed: {error.code} {detail}"
            ) from error

    def login(self) -> None:
        body = self._request(
            "POST",
            f"{self.args.accounts_url}/auth/login",
            {"email": self.args.email, "pwd": self.args.password},
        )
        self.token = body["data"]["accessToken"]

    async def create_session(self) -> Session:
        started_at = time.perf_counter()
        body = await asyncio.to_thread(
            self._request,
            "POST",
            f"{self.args.workspace_url}/assist/voice/sessions",
            {"flowVersionId": self.args.flow_version_id, "mode": self.args.mode},
        )
        created = body["data"]
        return Session(
            conversation_id=created["conversationId"],
            room_name=created["roomName"],
            server_url=created["serverUrl"],
            client_token=created["clientToken"],
            create_ms=round((time.perf_counter() - started_at) * 1000),
        )

    async def room_names(self) -> set[str]:
        async with api.LiveKitAPI(
            url=self.args.livekit_url,
            api_key=self.args.livekit_key,
            api_secret=self.args.livekit_secret,
        ) as livekit:
            rooms = await livekit.room.list_rooms(api.ListRoomsRequest())
            return {room.name for room in rooms.rooms}


async def _start_sessions(
    client: Client,
    count: int,
    abandon: int,
    ramp: float,
    join_timeout: float,
) -> list[Session]:
    sessions: list[Session] = []
    for index in range(count + abandon):
        try:
            session = await client.create_session()
        except Exception as error:
            print(f"create failed: {type(error).__name__}: {error}")
            session = Session(
                "", "", "", "", 0, error=f"{type(error).__name__}: {error}"
            )
        else:
            if index < count:
                await _join(session, join_timeout)
        sessions.append(session)
        if ramp and index + 1 < count + abandon:
            await asyncio.sleep(ramp)
    return sessions


async def _join(session: Session, timeout: float) -> None:
    started_at = time.perf_counter()
    room = rtc.Room()
    try:
        await room.connect(session.server_url, session.client_token)
        deadline = started_at + timeout
        while time.perf_counter() < deadline:
            if any(
                identity.startswith(AGENT_IDENTITY_PREFIX)
                for identity in room.remote_participants
            ):
                session.join_ms = round((time.perf_counter() - started_at) * 1000)
                session.room = room
                return
            if not room.isconnected():
                session.error = "room closed before the agent joined"
                return
            await asyncio.sleep(0.2)
        session.error = "agent did not join"
    except Exception as error:
        session.error = f"{type(error).__name__}: {error}"
    with suppress(Exception):
        await room.disconnect()


async def _leave_all(sessions: Sequence[Session]) -> None:
    await asyncio.gather(
        *(
            session.room.disconnect()
            for session in sessions
            if session.room is not None
        ),
        return_exceptions=True,
    )


async def _await_teardown(
    client: Client, sessions: Sequence[Session], timeout: float
) -> set[str]:
    expected = {session.room_name for session in sessions if session.room_name}
    remaining = set(expected)
    started_at = time.perf_counter()
    while remaining and time.perf_counter() - started_at < timeout:
        present = await client.room_names()
        gone = remaining - present
        for session in sessions:
            if session.room_name in gone and session.teardown_ms is None:
                session.teardown_ms = round((time.perf_counter() - started_at) * 1000)
        remaining = {name for name in remaining if name in present}
        if remaining:
            await asyncio.sleep(0.5)
    return remaining


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--flow-version-id", required=True)
    parser.add_argument("--sessions", type=int, default=10)
    parser.add_argument(
        "--abandon",
        type=int,
        default=0,
        help=(
            "Sessions to create without joining, to verify the worker's "
            "join-timeout teardown."
        ),
    )
    parser.add_argument("--hold", type=float, default=30.0)
    parser.add_argument(
        "--ramp",
        type=float,
        default=0.0,
        help=(
            "Seconds between session starts; a ramp measures sustained load "
            "instead of a burst."
        ),
    )
    parser.add_argument("--mode", choices=("test", "live"), default="test")
    parser.add_argument("--join-timeout", type=float, default=90.0)
    parser.add_argument("--teardown-timeout", type=float, default=60.0)
    parser.add_argument("--email", default=os.getenv("MY_EMAIL", ""))
    parser.add_argument("--password", default=os.getenv("MY_PWD", ""))
    parser.add_argument("--accounts-url", default=DEFAULT_ACCOUNTS_URL)
    parser.add_argument("--workspace-url", default=DEFAULT_WORKSPACE_URL)
    parser.add_argument("--livekit-url", default=DEFAULT_LIVEKIT_URL)
    parser.add_argument("--livekit-key", default="devkey")
    parser.add_argument("--livekit-secret", default="secret")
    parser.add_argument(
        "--verify",
        action="store_true",
        help="Verify TLS certificates; the local stack uses a self-signed certificate.",
    )
    args = parser.parse_args()
    if not args.email or not args.password:
        parser.error("--email/--password or MY_EMAIL/MY_PWD are required")
    if args.sessions < 1:
        parser.error("--sessions must be at least 1")
    if args.abandon < 0:
        parser.error("--abandon cannot be negative")
    return args


async def run(args: argparse.Namespace) -> int:
    client = Client(args)
    await asyncio.to_thread(client.login)

    print(
        f"starting {args.sessions} sessions hold={args.hold:g}s "
        f"ramp={args.ramp:g}s mode={args.mode} abandon={args.abandon}"
    )
    sessions = await _start_sessions(
        client, args.sessions, args.abandon, args.ramp, args.join_timeout
    )
    created = [session for session in sessions if session.room_name]
    joined = [session for session in created if session.join_ms is not None]

    if joined:
        await asyncio.sleep(args.hold)
    await _leave_all(joined)

    remaining = await _await_teardown(client, created, args.teardown_timeout)
    torn_down = [
        session for session in created if session.teardown_ms is not None
    ]

    print()
    print(
        f"| sessions | abandon | hold | created | joined | create p50 / p95 (ms) "
        f"| agent join p50 / p95 (ms) | teardown p50 / p95 (ms) | leftover rooms |"
    )
    print("| --- | --- | --- | --- | --- | --- | --- | --- | --- |")
    print(
        f"| {args.sessions} | {args.abandon} | {args.hold:g} s | {len(created)} "
        f"| {len(joined)} "
        f"| {latency([session.create_ms for session in created])} "
        f"| {latency([session.join_ms for session in joined])} "
        f"| {latency([session.teardown_ms for session in torn_down])} "
        f"| {len(remaining)} |"
    )
    print()
    print(f"sessions joined: {len(joined)}/{args.sessions}")
    print(f"rooms torn down: {len(torn_down)}/{len(created)}")

    for session in sessions:
        if session.room_name and session.teardown_ms is None:
            print(
                f"leftover room={session.room_name} "
                f"conversation={session.conversation_id}"
            )
        if session.error:
            print(
                f"failed room={session.room_name} "
                f"conversation={session.conversation_id} error={session.error}"
            )

    return (
        0
        if len(created) == args.sessions + args.abandon
        and len(joined) == args.sessions
        and not remaining
        else 1
    )


def main() -> None:
    raise SystemExit(asyncio.run(run(_parse_args())))


if __name__ == "__main__":
    main()

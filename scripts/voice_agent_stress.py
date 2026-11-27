r"""Stress-test voice agent call cycles through the Workspace API.

SETUP AND USAGE
---------------
1. Use the llmpipeline virtualenv; it provides ``httpx`` and the LiveKit SDK.
   Wait until the stack and LiveKit agent are ready; a cold stack can return
   502 or miss the first agent join.
2. Create ``local-logs/voice-stress/voice-stress.json`` and keep its full path
   handy. ``local-*`` is already ignored; never commit this file because it
   can contain access tokens or passwords.
3. Put the target site origin, run size, agent names, and authentication in
   that file:

   {
     "base_url": "https://local-avintra.aventisia.com",
     "iterations": 10,
     "concurrency": 1,
     "agents": ["Support agent", "Sales agent"],
     "tokens": ["paste-an-access-token-here"],
     "users": []
   }

   ``base_url`` may be:
   ``https://avintra.aventisia.com``,
   ``https://uat-avintra.aventisia.com``, or
   ``https://local-avintra.aventisia.com``.
   The script derives ``/workspace/api`` and ``/accounts/api`` from it.
   Use either access tokens in ``tokens`` or email/password objects in
   ``users``. A user object is ``{"email": "...", "password": "..."}``.
4. Run the cycles in the config by passing only its full path:

   # PowerShell
   apis/llmpipeline/venv/Scripts/python.exe scripts/voice_agent_stress.py `
     --config "C:\path\to\avintra-wt\wt-3\local-logs\voice-stress\voice-stress.json"

   # Command Prompt
   apis/llmpipeline/venv/Scripts/python.exe scripts/voice_agent_stress.py ^
     --config "C:\path\to\avintra-wt\wt-3\local-logs\voice-stress\voice-stress.json"

Required JSON keys are ``base_url``, ``iterations``, ``agents``, and either
``tokens`` or ``users``. Optional JSON keys are ``concurrency`` (default 1, so
cycles run one at a time), ``verify_tls`` (default true),
``accounts_base_url``, and ``report_dir``. ``--base-url``, ``--iterations``,
``--concurrency``, and ``--report-dir`` can override the JSON values.

For every agent and iteration, the script creates a session, joins its LiveKit
room, waits for ``lk.agent.state`` to become ``listening`` or ``speaking``,
ends the session, and disconnects. Failed cycles also attempt cleanup.

Reports are written to ``local-logs/voice-stress/runs/<utc-timestamp>``:
``report.md``, ``report.json``, ``report.csv``, and incremental
``results.jsonl``. ``--dry-run`` validates the local config and prints the plan
without calling an API.
"""

# The JSON example and execution commands above are comments intentionally:
# create the JSON file yourself, then pass its full path with ``--config``.

from __future__ import annotations

import argparse
import asyncio
import csv
import json
import math
import statistics
import sys
import time
from collections import Counter
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import httpx
from livekit import rtc

AGENT_STATES = {"listening", "speaking"}
CREATE_PATH = "/assist/voice/sessions"
RUNS_DIR = Path("local-logs/voice-stress/runs")
MAX_ACTIVE_PER_CREDENTIAL = 50
LISTEN_TIMEOUT_S = 90
CONNECT_TIMEOUT_S = 30
REQUEST_TIMEOUT_S = 60


class CycleError(Exception):
    """A cycle failed at one named stage."""

    def __init__(self, code: str, detail: str = ""):
        super().__init__(detail or code)
        self.code = code
        self.detail = detail


@dataclass
class Lease:
    """One credential used by a lane; tokens can be refreshed when credentials exist."""

    label: str
    token: str = ""
    email: str | None = None
    password: str | None = None
    lock: asyncio.Lock = field(default_factory=asyncio.Lock)

    @property
    def can_refresh(self) -> bool:
        return bool(self.email and self.password)


@dataclass
class RunConfig:
    target: str
    workspace_url: str
    accounts_url: str
    verify_tls: bool
    iterations: int
    concurrency: int
    agent_names: list[str]
    leases: list[Lease]
    report_dir: Path
    lanes: int = 1


def positive_int(raw: dict, key: str, default: int, minimum: int = 1) -> int:
    try:
        value = int(raw.get(key, default))
    except (TypeError, ValueError):
        raise SystemExit(f"{key} must be an integer")
    if value < minimum:
        raise SystemExit(f"{key} must be >= {minimum}")
    return value


def derive_api_urls(base_url: str, accounts_override: str | None) -> tuple[str, str]:
    base = base_url.strip().rstrip("/")
    if not base.startswith(("http://", "https://")):
        raise SystemExit("base_url must start with http:// or https://")
    if base.endswith("/workspace/api"):
        workspace = base
        accounts = base[: -len("/workspace/api")] + "/accounts/api"
    elif base.endswith("/accounts/api"):
        accounts = base
        workspace = base[: -len("/accounts/api")] + "/workspace/api"
    else:
        workspace = base + "/workspace/api"
        accounts = base + "/accounts/api"
    if accounts_override:
        accounts = accounts_override.strip().rstrip("/")
    return workspace, accounts


def build_config(raw: dict, iterations: int | None, overrides: dict) -> RunConfig:
    overrides = {key: value for key, value in overrides.items() if value is not None}
    base_url = str(overrides.get("base_url") or raw.get("base_url") or "").strip()
    if not base_url:
        raise SystemExit("config needs base_url")
    workspace_url, accounts_url = derive_api_urls(
        base_url, raw.get("accounts_base_url")
    )

    agent_names: list[str] = []
    for item in raw.get("agents") or []:
        name = str(item).strip() if isinstance(item, str) else ""
        if not name:
            raise SystemExit("agents must be a list of voice agent names")
        if name not in agent_names:
            agent_names.append(name)
    if not agent_names:
        raise SystemExit("config needs at least one voice agent name")

    tokens = [str(token).strip() for token in raw.get("tokens") or [] if str(token).strip()]
    leases = [Lease(label=f"token-{index + 1}", token=token) for index, token in enumerate(tokens)]
    for index, user in enumerate(raw.get("users") or []):
        email = str(user.get("email") or "").strip()
        password = str(user.get("password") or "")
        if not email or not password:
            raise SystemExit(f"user-{index + 1} needs email and password")
        leases.append(Lease(label=f"user-{index + 1}", email=email, password=password))
    if not leases:
        raise SystemExit("config needs tokens or users")

    if iterations is None:
        iterations = raw.get("iterations")
    try:
        iterations = int(iterations)
    except (TypeError, ValueError):
        raise SystemExit("config needs iterations or --iterations")
    if iterations < 1:
        raise SystemExit("iterations must be >= 1")
    concurrency = positive_int({**raw, **overrides}, "concurrency", 1)
    planned = len(agent_names) * iterations
    capacity = len(leases) * MAX_ACTIVE_PER_CREDENTIAL
    lanes = max(1, min(concurrency, planned, capacity))

    report_dir_value = overrides.get("report_dir") or raw.get("report_dir")
    report_dir = (
        Path(str(report_dir_value))
        if report_dir_value
        else RUNS_DIR / datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    )

    return RunConfig(
        target=base_url.rstrip("/"),
        workspace_url=workspace_url,
        accounts_url=accounts_url,
        verify_tls=bool(raw.get("verify_tls", True)),
        iterations=iterations,
        concurrency=concurrency,
        agent_names=agent_names,
        leases=leases,
        report_dir=report_dir,
        lanes=lanes,
    )


def elapsed_ms(started: float) -> int:
    return int(round((time.perf_counter() - started) * 1000))


async def login(client: httpx.AsyncClient, accounts_url: str, lease: Lease) -> None:
    try:
        response = await client.post(
            f"{accounts_url}/auth/login",
            json={"email": lease.email, "pwd": lease.password},
            timeout=REQUEST_TIMEOUT_S,
        )
    except httpx.HTTPError as exc:
        raise CycleError("login_error", f"{lease.label}: {exc}") from exc
    if response.status_code != 200:
        raise CycleError(
            f"login_http_{response.status_code}",
            f"{lease.label}: {response.text[:200]}",
        )
    data = (response.json() or {}).get("data") or {}
    token = data.get("accessToken")
    if not token:
        raise CycleError(
            "login_no_token",
            f"{lease.label}: login returned no accessToken (2FA or password change?)",
        )
    lease.token = str(token)


async def refresh_lease(client: httpx.AsyncClient, config: RunConfig, lease: Lease) -> None:
    async with lease.lock:
        await login(client, config.accounts_url, lease)


async def authed_request(
    client: httpx.AsyncClient,
    config: RunConfig,
    lease: Lease,
    method: str,
    url: str,
    body: dict | None = None,
    params: dict | None = None,
    space_id: str | None = None,
) -> httpx.Response:
    response: httpx.Response | None = None
    for attempt in range(2):
        headers = {"Authorization": f"Bearer {lease.token}"}
        if space_id:
            headers["X-Space-Id"] = space_id
        try:
            response = await client.request(
                method,
                url,
                headers=headers,
                json=body,
                params=params,
                timeout=REQUEST_TIMEOUT_S,
            )
        except httpx.HTTPError as exc:
            raise CycleError("http_error", str(exc)) from exc
        if response.status_code == 401 and attempt == 0 and lease.can_refresh:
            await refresh_lease(client, config, lease)
            continue
        return response
    assert response is not None
    return response


async def discover_scopes(
    client: httpx.AsyncClient, config: RunConfig, lease: Lease
) -> list[str | None]:
    scopes: list[str | None] = [None]
    response = await authed_request(
        client, config, lease, "GET", f"{config.accounts_url}/space/list"
    )
    if response.status_code != 200:
        return scopes
    for space in (response.json() or {}).get("data") or []:
        if space.get("id") and not space.get("isDisabled"):
            scopes.append(str(space["id"]))
    return scopes


async def list_voice_flows(
    client: httpx.AsyncClient, config: RunConfig, lease: Lease
) -> list[dict[str, str | None]]:
    flows: list[dict[str, str | None]] = []
    seen: set[str] = set()
    failures: list[str] = []
    for space_id in await discover_scopes(client, config, lease):
        for path in ("/flow/list", "/flow/list/shared"):
            response = await authed_request(
                client,
                config,
                lease,
                "GET",
                f"{config.workspace_url}{path}",
                space_id=space_id,
            )
            if response.status_code != 200:
                failures.append(f"{path} {response.status_code}")
                continue
            for flow in (response.json() or {}).get("data") or []:
                flow_type = flow.get("type")
                if flow_type not in ("VoiceAgent", 3):
                    continue
                flow_id = str(flow.get("id") or "")
                if not flow_id or flow_id in seen:
                    continue
                seen.add(flow_id)
                flows.append(
                    {
                        "id": flow_id,
                        "name": str(flow.get("name") or ""),
                        "space_id": space_id,
                    }
                )
    if not flows and failures:
        raise SystemExit(
            "could not list voice agents; check base_url and the credential "
            f"({' / '.join(sorted(set(failures)))})"
        )
    return flows


async def list_versions(
    client: httpx.AsyncClient,
    config: RunConfig,
    lease: Lease,
    flow: dict[str, str | None],
) -> list[dict]:
    response = await authed_request(
        client,
        config,
        lease,
        "GET",
        f"{config.workspace_url}/flow-version/list/{flow['id']}",
        space_id=flow["space_id"],
    )
    if response.status_code != 200:
        raise CycleError(
            f"version_list_http_{response.status_code}",
            f"{flow.get('name') or flow['id']}: {response.text[:200]}",
        )
    return (response.json() or {}).get("data") or []


def normalize_name(value: str) -> str:
    return " ".join(value.split()).casefold()


async def resolve_agents(
    client: httpx.AsyncClient, config: RunConfig, lease: Lease
) -> list[dict[str, str | None]]:
    flows = await list_voice_flows(client, config, lease)
    by_name: dict[str, list[dict[str, str | None]]] = {}
    for flow in flows:
        by_name.setdefault(normalize_name(str(flow["name"])), []).append(flow)

    resolved: list[dict[str, str | None]] = []
    missing: list[str] = []
    versions_by_flow: dict[str, list[dict]] = {}
    for name in config.agent_names:
        matches = by_name.get(normalize_name(name)) or []
        best: tuple[int, str, dict, dict[str, str | None]] | None = None
        for flow in matches:
            flow_id = str(flow["id"])
            if flow_id not in versions_by_flow:
                versions_by_flow[flow_id] = await list_versions(client, config, lease, flow)
            for version in versions_by_flow[flow_id]:
                if version.get("isArchived"):
                    continue
                candidate = (
                    int(version.get("versionNumber") or 0),
                    str(version.get("createdOn") or ""),
                    version,
                    flow,
                )
                if best is None or candidate[:2] > best[:2]:
                    best = candidate
        if best is None:
            missing.append(name)
            continue
        version, flow = best[2], best[3]
        resolved.append(
            {
                "name": name,
                "flow_version_id": str(version["id"]),
                "mode": "live" if version.get("isPublished") else "test",
                "space_id": flow["space_id"],
                "version_number": version.get("versionNumber"),
            }
        )

    if missing:
        available = sorted({str(flow["name"]) for flow in flows})
        hint = ", ".join(available[:25]) if available else "none visible to this credential"
        raise SystemExit(
            f"voice agent name not found: {', '.join(missing)} "
            f"(available VoiceAgent flows: {hint})"
        )
    return resolved


async def disconnect_room(room: rtc.Room) -> None:
    try:
        await asyncio.wait_for(room.disconnect(), timeout=10)
    except Exception:
        pass


async def wait_for_agent(
    room: rtc.Room, timeout_s: float, started: float
) -> tuple[str, int | None]:
    loop = asyncio.get_running_loop()
    deadline = loop.time() + timeout_s
    joined_ms: int | None = None
    while loop.time() < deadline:
        for participant in room.remote_participants.values():
            attributes = participant.attributes or {}
            state = attributes.get("lk.agent.state")
            if joined_ms is None and (state is not None or participant.identity.startswith("agent-")):
                joined_ms = elapsed_ms(started)
            if state in AGENT_STATES:
                return state, joined_ms
        await asyncio.sleep(0.25)
    if joined_ms is not None:
        raise CycleError(
            "listen_timeout",
            f"agent joined but never reported listening/speaking within {timeout_s:.0f}s",
        )
    raise CycleError("agent_not_joined", f"no agent participant within {timeout_s:.0f}s")


async def run_cycle(
    client: httpx.AsyncClient,
    config: RunConfig,
    lease: Lease,
    agent: dict[str, str | None],
    iteration: int,
    lane: int,
) -> dict:
    started_at = datetime.now(timezone.utc)
    started = time.perf_counter()
    row: dict[str, Any] = {
        "iteration": iteration,
        "agent": agent["name"],
        "flow_version_id": agent["flow_version_id"],
        "version_number": agent.get("version_number"),
        "mode": agent["mode"],
        "space_id": agent.get("space_id") or "",
        "lane": lane,
        "auth": lease.label,
        "started_at": started_at.isoformat(),
        "result": "failed",
        "error": "",
        "error_detail": "",
        "create_status": None,
        "end_status": None,
        "fallback_end_status": None,
        "conversation_id": "",
        "room_name": "",
        "agent_joined_ms": None,
        "agent_state": "",
        "create_ms": None,
        "connect_ms": None,
        "listen_ms": None,
        "end_ms": None,
        "total_ms": None,
    }
    room: rtc.Room | None = None
    conversation_id: str | None = None
    end_done = False
    try:
        response = await authed_request(
            client,
            config,
            lease,
            "POST",
            f"{config.workspace_url}{CREATE_PATH}",
            {"flowVersionId": agent["flow_version_id"], "mode": agent["mode"]},
            space_id=agent.get("space_id"),
        )
        row["create_status"] = response.status_code
        if response.status_code != 200:
            raise CycleError(f"create_http_{response.status_code}", response.text[:300])
        session = (response.json() or {}).get("data") or {}
        conversation_id = str(session.get("conversationId") or "")
        if not conversation_id or not session.get("clientToken") or not session.get("serverUrl"):
            raise CycleError("create_invalid_response", response.text[:300])
        row["conversation_id"] = conversation_id
        row["room_name"] = str(session.get("roomName") or "")
        row["create_ms"] = elapsed_ms(started)

        room = rtc.Room()
        try:
            await asyncio.wait_for(
                room.connect(
                    str(session["serverUrl"]),
                    str(session["clientToken"]),
                    rtc.RoomOptions(auto_subscribe=False),
                ),
                timeout=CONNECT_TIMEOUT_S,
            )
        except asyncio.TimeoutError:
            raise CycleError("connect_timeout", f"LiveKit join exceeded {CONNECT_TIMEOUT_S}s")
        row["connect_ms"] = elapsed_ms(started)

        state, joined_ms = await wait_for_agent(room, LISTEN_TIMEOUT_S, started)
        row["agent_state"] = state
        row["agent_joined_ms"] = joined_ms
        row["listen_ms"] = elapsed_ms(started)

        end_started = time.perf_counter()
        results = await asyncio.gather(
            authed_request(
                client,
                config,
                lease,
                "POST",
                f"{config.workspace_url}{CREATE_PATH}/{conversation_id}/end",
                space_id=agent.get("space_id"),
            ),
            disconnect_room(room),
            return_exceptions=True,
        )
        row["end_ms"] = elapsed_ms(end_started)
        end_result = results[0]
        if isinstance(end_result, BaseException):
            raise CycleError("end_error", str(end_result))
        end_response: httpx.Response = end_result
        row["end_status"] = end_response.status_code
        end_done = end_response.status_code == 200
        if end_response.status_code != 200:
            raise CycleError(f"end_http_{end_response.status_code}", end_response.text[:300])
        row["result"] = "ok"
    except CycleError as exc:
        row["error"] = exc.code
        row["error_detail"] = exc.detail
    except asyncio.TimeoutError:
        row["error"] = "cycle_timeout"
    except Exception as exc:
        row["error"] = "unexpected_error"
        row["error_detail"] = f"{type(exc).__name__}: {exc}"
    finally:
        row["total_ms"] = elapsed_ms(started)
        if room is not None:
            await disconnect_room(room)
        if conversation_id and not end_done:
            try:
                response = await authed_request(
                    client,
                    config,
                    lease,
                    "POST",
                    f"{config.workspace_url}{CREATE_PATH}/{conversation_id}/end",
                    space_id=agent.get("space_id"),
                )
                row["fallback_end_status"] = response.status_code
            except Exception as exc:
                row["error_detail"] = (
                    f"{row['error_detail']} | fallback end: {exc}".strip(" |")
                )
    return row


class JsonlWriter:
    def __init__(self, path: Path):
        self._handle = path.open("a", encoding="utf-8")
        self._lock = asyncio.Lock()

    async def write(self, row: dict) -> None:
        async with self._lock:
            self._handle.write(json.dumps(row, ensure_ascii=False) + "\n")
            self._handle.flush()

    def close(self) -> None:
        self._handle.close()


async def run_lane(
    lane: int,
    client: httpx.AsyncClient,
    config: RunConfig,
    lease: Lease,
    queue: asyncio.Queue,
    writer: JsonlWriter,
    records: list[dict],
) -> None:
    while True:
        try:
            sequence, agent, iteration = queue.get_nowait()
        except asyncio.QueueEmpty:
            return
        row = await run_cycle(client, config, lease, agent, iteration, lane)
        await writer.write(row)
        records.append(row)
        parts = [f"#{sequence:03d}", f"lane {lane:02d}", str(agent["name"]), row["result"]]
        if row["listen_ms"] is not None:
            parts.append(f"listen={row['listen_ms'] / 1000:.1f}s")
        if row["end_ms"] is not None:
            parts.append(f"end={row['end_ms']}ms")
        if row["error"]:
            parts.append(f"error={row['error']}")
        print(" ".join(parts), flush=True)


def percentile(sorted_values: list[float], value: float) -> float:
    if len(sorted_values) == 1:
        return sorted_values[0]
    position = (len(sorted_values) - 1) * value / 100
    lower = math.floor(position)
    upper = math.ceil(position)
    if lower == upper:
        return sorted_values[lower]
    return sorted_values[lower] + (sorted_values[upper] - sorted_values[lower]) * (
        position - lower
    )


def latency_stats(values: list[int]) -> dict:
    clean = sorted(value for value in values if value is not None)
    if not clean:
        return {}
    return {
        "count": len(clean),
        "min": clean[0],
        "p50": round(percentile(clean, 50)),
        "p95": round(percentile(clean, 95)),
        "max": clean[-1],
        "mean": round(statistics.fmean(clean)),
    }


def summarize(config: RunConfig, agents: list[dict], records: list[dict]) -> dict:
    failed = [row for row in records if row["result"] != "ok"]
    leaked = [
        row
        for row in records
        if row["conversation_id"]
        and row["end_status"] != 200
        and row["fallback_end_status"] != 200
    ]
    per_agent: dict[str, dict] = {}
    for agent in agents:
        rows = [
            row
            for row in records
            if row["flow_version_id"] == agent["flow_version_id"] and row["agent"] == agent["name"]
        ]
        per_agent[f"{agent['name']} ({str(agent['flow_version_id'])[:8]})"] = {
            "mode": agent["mode"],
            "planned": config.iterations,
            "attempted": len(rows),
            "ok": sum(1 for row in rows if row["result"] == "ok"),
            "failed": sum(1 for row in rows if row["result"] != "ok"),
            "listen_ms": latency_stats([row["listen_ms"] for row in rows]),
            "end_ms": latency_stats([row["end_ms"] for row in rows]),
        }
    return {
        "attempted": len(records),
        "ok": len(records) - len(failed),
        "failed": len(failed),
        "reached_live": sum(1 for row in records if row["listen_ms"] is not None),
        "leaked_sessions": len(leaked),
        "leaked_conversation_ids": [row["conversation_id"] for row in leaked],
        "error_counts": dict(sorted(Counter(row["error"] for row in failed).items())),
        "latency_ms": {
            "create": latency_stats([row["create_ms"] for row in records]),
            "connect": latency_stats([row["connect_ms"] for row in records]),
            "listen": latency_stats([row["listen_ms"] for row in records]),
            "end": latency_stats([row["end_ms"] for row in records if row["result"] == "ok"]),
            "total": latency_stats([row["total_ms"] for row in records]),
        },
        "per_agent": per_agent,
    }


def format_latency(stats: dict) -> str:
    if not stats:
        return "-"
    return f"{stats['p50']} / {stats['p95']} / {stats['max']}"


def write_markdown(
    path: Path,
    config: RunConfig,
    agents: list[dict],
    records: list[dict],
    summary: dict,
    started_at: str,
    finished_at: str,
) -> None:
    planned = len(agents) * config.iterations
    lines = [
        "# Voice Agent Stress Run",
        "",
        f"**Target:** `{config.target}`  ",
        f"**Workspace API:** `{config.workspace_url}`  ",
        f"**Window:** {started_at} to {finished_at}  ",
        (
            f"**Plan:** {len(agents)} agent(s) x {config.iterations} iteration(s) = "
            f"{planned} cycles, concurrency {config.concurrency} ({config.lanes} lane(s)), "
            f"{len(config.leases)} credential(s), max {MAX_ACTIVE_PER_CREDENTIAL} active "
            "sessions per credential."
        ),
        "",
        "A call counts as live when the agent participant reports `lk.agent.state` "
        "`listening` or `speaking` in the LiveKit room.",
        "",
        "## Result",
        "",
        "| Metric | Value |",
        "|---|---|",
        f"| Cycles attempted | {summary['attempted']} / {planned} |",
        f"| Reached a live call | {summary['reached_live']} |",
        f"| Succeeded | {summary['ok']} |",
        f"| Failed | {summary['failed']} |",
        f"| Sessions created but not ended | {summary['leaked_sessions']} |",
        "",
        "## Latency (ms)",
        "",
        "| Stage | n | min | p50 | p95 | max |",
        "|---|---|---|---|---|---|",
    ]
    stages = [
        ("Create response", "create"),
        ("LiveKit connect", "connect"),
        ("Agent listening/speaking", "listen"),
        ("End request + disconnect", "end"),
        ("Total cycle", "total"),
    ]
    for label, key in stages:
        stats = summary["latency_ms"][key]
        if not stats:
            lines.append(f"| {label} | 0 | - | - | - | - |")
            continue
        lines.append(
            f"| {label} | {stats['count']} | {stats['min']} | {stats['p50']} | "
            f"{stats['p95']} | {stats['max']} |"
        )

    lines += [
        "",
        "## Per agent",
        "",
        "| Agent | Mode | Version | Planned | Attempted | OK | Failed | Listen p50 / p95 / max | End p50 / p95 / max |",
        "|---|---|---|---|---|---|---|---|---|",
    ]
    for agent in agents:
        key = f"{agent['name']} ({str(agent['flow_version_id'])[:8]})"
        stats = summary["per_agent"][key]
        lines.append(
            f"| {agent['name']} | {agent['mode']} | {agent.get('version_number') or '-'} | "
            f"{stats['planned']} | {stats['attempted']} | {stats['ok']} | {stats['failed']} | "
            f"{format_latency(stats['listen_ms'])} | {format_latency(stats['end_ms'])} |"
        )

    if summary["error_counts"]:
        lines += ["", "## Failures", "", "| Error | Count |", "|---|---|"]
        for error, count in summary["error_counts"].items():
            lines.append(f"| `{error}` | {count} |")

    if summary["leaked_conversation_ids"]:
        lines += [
            "",
            "## Sessions needing manual end",
            "",
            *[f"- `{conversation_id}`" for conversation_id in summary["leaked_conversation_ids"]],
        ]

    lines += [
        "",
        "## Notes",
        "",
        "- `create_http_429` means the credential hit the server's per-user active voice session cap; raise `MAX_ACTIVE_VOICE_SESSIONS_PER_USER` or add more credentials.",
        "- The caller joins the room but publishes no microphone audio, so agent turns are not exercised; teardown and session accounting are.",
        "- Timings come from this machine; network distance to the target is included.",
        "",
    ]
    path.write_text("\n".join(lines), encoding="utf-8")


def write_reports(
    config: RunConfig,
    agents: list[dict],
    records: list[dict],
    started_at: str,
    finished_at: str,
) -> dict:
    config.report_dir.mkdir(parents=True, exist_ok=True)
    summary = summarize(config, agents, records)
    report = {
        "started_at": started_at,
        "finished_at": finished_at,
        "target": {
            "base_url": config.target,
            "workspace_url": config.workspace_url,
            "accounts_url": config.accounts_url,
        },
        "run": {
            "iterations": config.iterations,
            "concurrency": config.concurrency,
            "lanes": config.lanes,
            "max_active_per_credential": MAX_ACTIVE_PER_CREDENTIAL,
            "agents": agents,
            "credentials": [lease.label for lease in config.leases],
        },
        "summary": summary,
        "records": records,
    }
    (config.report_dir / "report.json").write_text(
        json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    write_markdown(
        config.report_dir / "report.md",
        config,
        agents,
        records,
        summary,
        started_at,
        finished_at,
    )

    with (config.report_dir / "report.csv").open("w", newline="", encoding="utf-8-sig") as handle:
        fields = [
            "iteration",
            "agent",
            "flow_version_id",
            "version_number",
            "mode",
            "space_id",
            "lane",
            "auth",
            "started_at",
            "result",
            "error",
            "error_detail",
            "create_status",
            "end_status",
            "fallback_end_status",
            "create_ms",
            "connect_ms",
            "listen_ms",
            "end_ms",
            "total_ms",
            "agent_state",
            "agent_joined_ms",
            "conversation_id",
            "room_name",
        ]
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for row in records:
            writer.writerow({field: row.get(field) for field in fields})
    return summary


async def run(config: RunConfig) -> None:
    config.report_dir.mkdir(parents=True, exist_ok=True)
    started_at = datetime.now(timezone.utc).isoformat()
    writer = JsonlWriter(config.report_dir / "results.jsonl")
    records: list[dict] = []
    agents: list[dict] = []
    client = httpx.AsyncClient(
        verify=config.verify_tls,
        limits=httpx.Limits(
            max_connections=max(64, config.lanes + 8), max_keepalive_connections=32
        ),
    )
    try:
        if not config.verify_tls:
            print("TLS verification is off for this target.", flush=True)
        for lease in config.leases:
            if lease.can_refresh:
                try:
                    await login(client, config.accounts_url, lease)
                except CycleError as exc:
                    raise SystemExit(f"{lease.label} login failed: {exc.code} {exc.detail}")
                print(f"logged in {lease.label}", flush=True)
            else:
                print(f"using {lease.label}", flush=True)

        try:
            agents = await resolve_agents(client, config, config.leases[0])
        except CycleError as exc:
            raise SystemExit(f"agent name resolution failed: {exc.code} {exc.detail}")
        print("resolved agents:", flush=True)
        for agent in agents:
            space = agent.get("space_id") or "central"
            print(
                f"  {agent['name']} -> {agent['flow_version_id']} "
                f"(v{agent.get('version_number')}, {agent['mode']}, {space})",
                flush=True,
            )

        queue: asyncio.Queue = asyncio.Queue()
        sequence = 0
        for iteration in range(1, config.iterations + 1):
            for agent in agents:
                queue.put_nowait((sequence + 1, agent, iteration))
                sequence += 1
        print(
            f"starting {sequence} cycles on {config.target} with {config.lanes} lane(s)",
            flush=True,
        )
        tasks = [
            run_lane(
                lane,
                client,
                config,
                config.leases[lane % len(config.leases)],
                queue,
                writer,
                records,
            )
            for lane in range(config.lanes)
        ]
        await asyncio.gather(*tasks)
    finally:
        try:
            await client.aclose()
        except Exception:
            pass
        writer.close()
        finished_at = datetime.now(timezone.utc).isoformat()
        if records:
            summary = write_reports(config, agents, records, started_at, finished_at)
            print(
                f"done: {summary['ok']}/{summary['attempted']} ok, "
                f"{summary['failed']} failed, {summary['leaked_sessions']} leaked",
                flush=True,
            )
            print(f"report: {config.report_dir / 'report.md'}", flush=True)
            print(f"data:   {config.report_dir / 'report.json'}", flush=True)
        else:
            print("no cycles completed; nothing to report", flush=True)


def print_plan(config: RunConfig) -> None:
    planned = len(config.agent_names) * config.iterations
    print(f"target:    {config.target}")
    print(f"workspace: {config.workspace_url}")
    print(f"accounts:  {config.accounts_url}")
    print(f"agents:    {', '.join(config.agent_names)}")
    print(f"iterations per agent: {config.iterations}")
    print(f"cycles:    {planned}")
    print(
        f"concurrency: requested {config.concurrency}, using {config.lanes} lane(s) "
        f"(max {MAX_ACTIVE_PER_CREDENTIAL} active sessions per credential)"
    )
    print(f"credentials: {', '.join(lease.label for lease in config.leases)}")
    print(f"reports:   {config.report_dir}")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Stress-test voice agent start/end cycles through the Workspace API."
    )
    parser.add_argument("--config", required=True, help="JSON config file")
    parser.add_argument(
        "--iterations", type=int, help="cycles per agent (default from config)"
    )
    parser.add_argument("--base-url", help="override the config base URL")
    parser.add_argument("--concurrency", type=int, help="simultaneous calls (default 1)")
    parser.add_argument("--report-dir", help="output directory for the reports")
    parser.add_argument("--dry-run", action="store_true", help="validate and print the plan")
    args = parser.parse_args()

    try:
        raw = json.loads(Path(args.config).read_text(encoding="utf-8-sig"))
    except OSError as exc:
        print(f"cannot read config: {exc}", file=sys.stderr)
        return 2
    except json.JSONDecodeError as exc:
        print(f"invalid config JSON: {exc}", file=sys.stderr)
        return 2

    config = build_config(
        raw,
        args.iterations,
        {
            "base_url": args.base_url,
            "concurrency": args.concurrency,
            "report_dir": args.report_dir,
        },
    )
    print_plan(config)
    if args.dry_run:
        return 0
    if config.concurrency > config.lanes:
        print(
            "note: concurrency was capped by the planned cycles or by credentials x "
            f"{MAX_ACTIVE_PER_CREDENTIAL}",
            flush=True,
        )

    try:
        asyncio.run(run(config))
    except KeyboardInterrupt:
        print(
            f"interrupted; partial per-cycle data is in {config.report_dir / 'results.jsonl'}",
            file=sys.stderr,
        )
        return 130
    except SystemExit:
        raise
    except Exception as exc:
        print(f"run failed: {type(exc).__name__}: {exc}", file=sys.stderr)
        return 1
    report_path = config.report_dir / "report.json"
    if not report_path.exists():
        return 1
    summary = json.loads(report_path.read_text(encoding="utf-8"))["summary"]
    return 0 if summary["failed"] == 0 and summary["leaked_sessions"] == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())

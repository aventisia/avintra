"""Machine-checks that the Python SSRF blocklist matches the .NET twin exactly."""

import ipaddress
import re
from pathlib import Path

from app.features.custom_tools.url_guard import (
    _BLOCKED_IPV4_NETWORKS,
    _BLOCKED_IPV6_NETWORKS,
)

_DOTNET_URL_HELPERS = (
    Path(__file__).resolve().parents[3]
    / "apis"
    / "WorcBackend-legacy"
    / "WorkspaceAPIs"
    / "Features"
    / "CloudConnectors"
    / "CustomTool"
    / "Helpers"
    / "CustomToolUrlHelpers.cs"
)

_ENTRY_PATTERN = re.compile(r"\(new byte\[\]\s*\{([^}]*)\}\s*,\s*(\d+)\)")


def test_python_ipv4_blocklist_matches_dotnet():
    assert _python_networks(_BLOCKED_IPV4_NETWORKS) == _dotnet_networks(
        "BlockedIPv4Networks"
    )


def test_python_ipv6_blocklist_matches_dotnet():
    assert _python_networks(_BLOCKED_IPV6_NETWORKS) == _dotnet_networks(
        "BlockedIPv6Networks"
    )


def _dotnet_networks(field_name: str) -> set[tuple[str, int]]:
    source = _DOTNET_URL_HELPERS.read_text(encoding="utf-8")
    block = source.split(field_name, 1)[1].split("];", 1)[0]
    networks: set[tuple[str, int]] = set()
    for byte_list, prefix_length in _ENTRY_PATTERN.findall(block):
        raw = bytes(_parse_byte(token) for token in byte_list.split(",") if token.strip())
        networks.add((str(ipaddress.ip_address(raw)), int(prefix_length)))
    return networks


def _python_networks(networks) -> set[tuple[str, int]]:
    return {(str(network.network_address), network.prefixlen) for network in networks}


def _parse_byte(token: str) -> int:
    token = token.strip()
    return int(token, 16) if token.lower().startswith("0x") else int(token, 10)

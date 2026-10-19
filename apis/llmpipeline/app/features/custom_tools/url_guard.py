import asyncio
import concurrent.futures
import ipaddress
import socket
from urllib.parse import urlparse

_ALLOWED_SCHEMES = ("http", "https")
_DNS_TIMEOUT_SECONDS = 5.0
_DNS_EXECUTOR = concurrent.futures.ThreadPoolExecutor(
    max_workers=8, thread_name_prefix="url-guard-dns"
)

# IMPORTANT NOTE: this blocklist must stay in sync with the .NET CustomToolUrlHelpers blocklist.
_BLOCKED_IPV4_NETWORKS = (
    ipaddress.ip_network("0.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("100.64.0.0/10"),
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("169.254.0.0/16"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.0.0.0/24"),
    ipaddress.ip_network("192.0.2.0/24"),
    ipaddress.ip_network("192.88.99.0/24"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("198.18.0.0/15"),
    ipaddress.ip_network("198.51.100.0/24"),
    ipaddress.ip_network("203.0.113.0/24"),
    ipaddress.ip_network("224.0.0.0/4"),
    ipaddress.ip_network("240.0.0.0/4"),
)

_BLOCKED_IPV6_NETWORKS = (
    ipaddress.ip_network("::/128"),
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("::/96"),
    ipaddress.ip_network("64:ff9b::/96"),
    ipaddress.ip_network("100::/64"),
    ipaddress.ip_network("2001:db8::/32"),
    ipaddress.ip_network("2002::/16"),
    ipaddress.ip_network("fc00::/7"),
    ipaddress.ip_network("fe80::/10"),
    ipaddress.ip_network("fec0::/10"),
    ipaddress.ip_network("ff00::/8"),
)


class UnsafeUrlError(ValueError):
    """Raised when a custom-tool URL targets a non-public address."""


def validate_public_http_url(url: str) -> str:
    """Validate that a URL is http/https and resolves only to public addresses."""
    parsed = urlparse(url)
    if parsed.scheme not in _ALLOWED_SCHEMES:
        raise UnsafeUrlError("Only http/https URLs are supported.")

    host = parsed.hostname
    if not host:
        raise UnsafeUrlError("URL host is required.")

    resolve_public_addresses(host)
    return url


def resolve_public_addresses(host: str) -> list[ipaddress.IPv4Address | ipaddress.IPv6Address]:
    """Resolve a host to its addresses, rejecting any that are not publicly routable."""
    return _require_public_addresses(_resolve_host(host))


async def resolve_public_addresses_async(
    host: str,
) -> list[ipaddress.IPv4Address | ipaddress.IPv6Address]:
    """Resolve a host on the event loop, rejecting any address that is not publicly routable."""
    literal_address = _parse_ip_literal(host)
    if literal_address is not None:
        addresses = [literal_address]
    else:
        try:
            infos = await asyncio.wait_for(
                asyncio.get_running_loop().getaddrinfo(host, None),
                timeout=_DNS_TIMEOUT_SECONDS,
            )
        except (asyncio.TimeoutError, socket.gaierror) as exc:
            raise UnsafeUrlError(f"Unable to resolve host '{host}'.") from exc
        addresses = _addresses_from_infos(host, infos)

    return _require_public_addresses(addresses)


def _require_public_addresses(
    addresses: list[ipaddress.IPv4Address | ipaddress.IPv6Address],
) -> list[ipaddress.IPv4Address | ipaddress.IPv6Address]:
    for address in addresses:
        if not _is_public_address(address):
            raise UnsafeUrlError("URL resolves to a non-public address.")
    return addresses


def _parse_ip_literal(host: str) -> ipaddress.IPv4Address | ipaddress.IPv6Address | None:
    try:
        return ipaddress.ip_address(host)
    except ValueError:
        return None


def _resolve_host(host: str) -> list[ipaddress.IPv4Address | ipaddress.IPv6Address]:
    literal_address = _parse_ip_literal(host)
    if literal_address is not None:
        return [literal_address]

    return _addresses_from_infos(host, _getaddrinfo_with_timeout(host))


def _addresses_from_infos(
    host: str, infos: list[tuple]
) -> list[ipaddress.IPv4Address | ipaddress.IPv6Address]:
    addresses: list[ipaddress.IPv4Address | ipaddress.IPv6Address] = []
    for info in infos:
        try:
            addresses.append(ipaddress.ip_address(info[4][0]))
        except ValueError:
            continue

    if not addresses:
        raise UnsafeUrlError(f"Unable to resolve host '{host}'.")
    return addresses


def _getaddrinfo_with_timeout(host: str) -> list[tuple]:
    future = _DNS_EXECUTOR.submit(socket.getaddrinfo, host, None)
    try:
        return future.result(timeout=_DNS_TIMEOUT_SECONDS)
    except (concurrent.futures.TimeoutError, socket.gaierror) as exc:
        raise UnsafeUrlError(f"Unable to resolve host '{host}'.") from exc


def _is_public_address(
    address: ipaddress.IPv4Address | ipaddress.IPv6Address,
) -> bool:
    if isinstance(address, ipaddress.IPv6Address) and address.ipv4_mapped is not None:
        address = address.ipv4_mapped

    blocked_networks = (
        _BLOCKED_IPV6_NETWORKS
        if isinstance(address, ipaddress.IPv6Address)
        else _BLOCKED_IPV4_NETWORKS
    )
    return not any(address in network for network in blocked_networks)

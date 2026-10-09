import asyncio
import ipaddress
import socket
from urllib.parse import urlparse

_ALLOWED_SCHEMES = ("http", "https")


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

    addresses = _resolve_host(host)
    for address in addresses:
        if not _is_public_address(address):
            raise UnsafeUrlError("URL resolves to a non-public address.")

    return url


async def ensure_public_http_url(url: str) -> str:
    """Validate a URL to a public host without blocking the event loop."""
    return await asyncio.to_thread(validate_public_http_url, url)


def _resolve_host(host: str) -> list[ipaddress.IPv4Address | ipaddress.IPv6Address]:
    try:
        return [ipaddress.ip_address(host)]
    except ValueError:
        pass

    try:
        infos = socket.getaddrinfo(host, None)
    except socket.gaierror as exc:
        raise UnsafeUrlError(f"Unable to resolve host '{host}'.") from exc

    addresses: list[ipaddress.IPv4Address | ipaddress.IPv6Address] = []
    for info in infos:
        try:
            addresses.append(ipaddress.ip_address(info[4][0]))
        except ValueError:
            continue

    if not addresses:
        raise UnsafeUrlError(f"Unable to resolve host '{host}'.")
    return addresses


def _is_public_address(
    address: ipaddress.IPv4Address | ipaddress.IPv6Address,
) -> bool:
    if isinstance(address, ipaddress.IPv6Address) and address.ipv4_mapped is not None:
        address = address.ipv4_mapped
    return address.is_global

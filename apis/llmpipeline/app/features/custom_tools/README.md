# Custom Tools

## Public-address (SSRF) rule

Both the .NET adapter (`apis/WorcBackend-legacy/WorkspaceAPIs/Features/CloudConnectors/CustomTool/Helpers/CustomToolUrlHelpers.cs`)
and this feature's `url_guard.py` only allow `http`/`https` targets whose host resolves exclusively to
public addresses. The two blocklists are identical and must be changed together:

- IPv4: `0.0.0.0/8`, `10.0.0.0/8`, `100.64.0.0/10`, `127.0.0.0/8`, `169.254.0.0/16`, `172.16.0.0/12`,
  `192.0.0.0/24`, `192.0.2.0/24`, `192.88.99.0/24`, `192.168.0.0/16`, `198.18.0.0/15`, `198.51.100.0/24`,
  `203.0.113.0/24`, `224.0.0.0/4`, `240.0.0.0/4`.
- IPv6: `::/128`, `::1/128`, `100::/64`, `2001:db8::/32`, `fc00::/7`, `fe80::/10`, `fec0::/10`, `ff00::/8`.

IPv4-mapped IPv6 addresses are unwrapped to IPv4 before the check, and a host is rejected when any of its
resolved addresses falls in a blocked range.

## Credential placement

`ApiKeyQuery` credentials put the secret in the request query string, where it can reach upstream access logs
and error strings. The .NET adapter and `credential_client.py` both implement it because providers that only
accept query keys exist; this is a known, accepted limitation pending a product decision, not a defect.
Header-based types (`Bearer`, `Basic`, `ApiKeyHeader`) are preferred wherever the provider supports them.

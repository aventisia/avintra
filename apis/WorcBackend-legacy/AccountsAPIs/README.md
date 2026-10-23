# AccountsAPIs

This directory contains the AccountsAPIs .NET service, including Dockerfile and configuration for containerized deployment.

## Files

- `AccountsAPIs.csproj`: Project file for the AccountsAPIs service
- `Dockerfile`: Multi-stage build for .NET 8.0
- `appsettings.json`, `appsettings.Development.json`: Application configuration
- `AspNetToolkit/`: Project dependency (ensure not excluded in Docker build)

## Usage

### 1. Build the Docker image (from project root):

```sh
# Build
sudo docker build -f apis/WorcBackend-legacy/AccountsAPIs/Dockerfile -t hub.aventisia.com/avplatform/accounts-apis:0.1.0 .

# Test run locally (assuming postgresql is running on localhost)
sudo docker run -d --name avplatform-accounts-apis --network host -p 4000:4000 -e ASPNETCORE_ENVIRONMENT=Localhost hub.aventisia.com/avplatform/accounts-apis:0.1.0

# Check logs
sudo docker logs -f avplatform-accounts-apis

# Stop and remove test container
sudo docker stop avplatform-accounts-apis && sudo docker rm avplatform-accounts-apis

# Push to private registry
sudo docker push hub.aventisia.com/avplatform/accounts-apis:0.1.0

# Login to private registry (if needed)
sudo docker login hub.aventisia.com
```

### 2. Environment variables

- `ASPNETCORE_URLS` (default: `http://+:4000`)
- `ASPNETCORE_ENVIRONMENT` (default: `Development`)

Override these at runtime as needed:

```sh
sudo docker run -d --name accounts-apis -p 4000:4000 \
	-e ASPNETCORE_ENVIRONMENT=Production \
	avplatform/accounts-apis:latest
```

In local development (`ASPNETCORE_ENVIRONMENT` or `DOTNET_ENVIRONMENT` set to `Localhost`), `.env.local` in this directory is loaded before Kestrel binds, so its `ASPNETCORE_URLS` takes precedence over the launch profile URL. Use it to run parallel worktrees on separate ports, and start the service with this directory as the working directory (`cd apis/WorcBackend-legacy/AccountsAPIs && dotnet run`, or the `accounts_apis` VS Code task) so `.env.local` is found.

### Deployment branding (self-hosted white-label)

Branding customization applies to **Enterprise** and **Commercial** deployments. **Community**
deployments keep the built-in Avintra/Aventisia branding (the endpoint returns defaults).

All keys are optional; an unset key falls back to the built-in default on the client. Invalid
values and oversized text (over 100 characters) are ignored at startup with a warning.

| Variable                              | Description                                                                        |
| ------------------------------------- | ---------------------------------------------------------------------------------- |
| `BRANDING_APP_NAME`                   | Product/app name used in the UI and document title (max 100 chars).               |
| `BRANDING_COMPANY_NAME`               | Company name (max 100 chars).                                                      |
| `BRANDING_COMPANY_LOGO_URL_LIGHT`     | Light full company wordmark used by the accounts app and the redirect, error, loading and not-found screens (absolute HTTPS URL on the deployment host, its subdomains, or an `EXTRA_BRANDING_HOSTS` entry). |
| `BRANDING_COMPANY_LOGO_URL_DARK`      | Dark company wordmark (same rules). Reserved for a future dark theme; used as the light variant's fallback. |
| `BRANDING_PRODUCT_LOGO_URL_LIGHT`     | Light product logo used by the workspace header (same rules).                      |
| `BRANDING_PRODUCT_LOGO_URL_DARK`      | Dark product logo (same rules). Used as the light variant's fallback.              |
| `BRANDING_SHORT_LOGO_URL_LIGHT`       | Light short logo used by the studio header (same rules).                           |
| `BRANDING_SHORT_LOGO_URL_DARK`        | Dark short logo (same rules). Used as the light variant's fallback.                |
| `BRANDING_FAVICON_URL_LIGHT`          | Light favicon (same rules).                                                        |
| `BRANDING_FAVICON_URL_DARK`           | Dark favicon (same rules). Used as the light variant's fallback.                   |
| `BRANDING_BACKGROUND_COLOR`           | `--background` brand color — hex, `rgb()`/`rgba()` or `hsl()`/`hsla()`.            |
| `BRANDING_FOREGROUND_COLOR`           | `--foreground` brand color (same formats).                                         |
| `BRANDING_PRIMARY_COLOR`              | `--primary` brand color (same formats).                                            |
| `BRANDING_PRIMARY_FOREGROUND_COLOR`   | `--primary-foreground` brand color; derived for contrast when unset (same formats).|
| `BRANDING_SECONDARY_COLOR`            | `--secondary` brand color — buttons, banner, tooltip (same formats).               |
| `BRANDING_SECONDARY_FOREGROUND_COLOR` | `--secondary-foreground` brand color; derived for contrast when unset (same formats).|
| `BRANDING_ACCENT_COLOR`               | `--accent` brand color; derived from the primary color when unset (same formats).  |
| `BRANDING_ACCENT_FOREGROUND_COLOR`    | `--accent-foreground` brand color (same formats).                                  |
| `EXTRA_BRANDING_HOSTS`                | Comma-separated extra hosts allowed to serve the asset URLs (each host and its subdomains). |

Asset URLs must be absolute **HTTPS** and served from the deployment's own domain: the
`APP_BASE_URL` host itself or any subdomain of it. Any other host is rejected unless it is listed
in `EXTRA_BRANDING_HOSTS` (comma-separated, trimmed, case-insensitive), which accepts each listed
host and its subdomains — use it for multi-environment setups that serve assets from a sibling
host. With `APP_BASE_URL=uat-avintra.aventisia.com`, `cdn.uat-avintra.aventisia.com` is accepted
but the parent `aventisia.com` and siblings such as `evil.aventisia.com` are not.
Absolute-URL `http`, relative paths and any other domain are rejected. Colors must use one of the
listed formats, with every channel a number.

`--accent` falls back to a tint of the primary color when unset and the focus `--ring` is always
derived from the primary color; readable `*-foreground` tokens are derived for contrast when unset.
The resolved values are served unauthenticated at `GET /accounts/api/branding` for the web apps to
consume at boot.

### 3. WSL2/PostgreSQL connectivity notes

- If running Docker Desktop on Windows and PostgreSQL in WSL2, containers cannot reach localhost in WSL2 by default.
- Find your WSL2 IP address (in WSL2: `hostname -I`), and use it in your connection string:
  - Example: `"Host=WSL2_IP_HERE; Port=5432;"`
- Ensure PostgreSQL is listening on `0.0.0.0` and `pg_hba.conf` allows connections from the Docker subnet.
- The WSL2 IP may change after a reboot.

---

# Troubleshooting

On error `net::ERR_CERT_AUTHORITY_INVALID`

- Ensure that your local development environment is set up to trust the self-signed SSL certificate.
- Open `https://localhost:4000` in your browser and accept the risk to add the certificate exception.

On migration `AddUniqueDefaultSpacePerTenant` (index `IX_Spaces_TenantId_IsDefault`) failing at startup

- The migration must be applied before the service runs, because startup applies pending
  migrations; a failure blocks the deployment.
- A database holding more than one default space per tenant (from the old check-then-insert race)
  aborts the unique index. De-duplicate first — keep one `IsDefault` space per tenant and unset or
  merge the rest; do not delete spaces blindly.
- Detect the affected tenants:

  ```sql
  SELECT "TenantId", count(*) FROM "Spaces" WHERE "IsDefault" GROUP BY 1 HAVING count(*) > 1;
  ```

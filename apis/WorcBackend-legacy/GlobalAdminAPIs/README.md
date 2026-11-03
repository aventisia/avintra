# GlobalAdminAPIs

Backend of the Global Admin web app and of the platform's on-prem enforcement checks. It serves
`https://globaladmin.aventisia.com/api` in production and `https://uat-globaladmin.aventisia.com/api` in UAT, and is
proxied as `/globaladmin/api` on the app host for local development. It manages on-premises customers (tenants),
their deployed instances, and the execution data those instances report; `AccountsAPIs` asks it for a deployment's
metadata at startup and posts usage to it at runtime.

The tree is a **verbatim port** of `aventisia/GlobalAdminAPIs` `main` at commit `1eb5d9e56018f700dde5bdadea04728a0400a093`
(82 files: 72 copied unchanged, 4 adapted, 6 not carried over — see [Provenance](#provenance)), except for seven
security fixes listed under [Security fixes vs upstream](#security-fixes-vs-upstream). Keep everything else that way:
the quirks listed in [Known quirks](#known-quirks) are production behavior, and "fixing" them changes what the
external service used to answer.

Startup configuration follows the `AccountsAPIs`/`WorkspaceAPIs` conventions — same required/optional split, same
defaults, same failure message — implemented by this project's own `Extensions/EnvironmentConfigurationExtensions.cs`.
It keeps no project or package dependency on `AspNetToolkit`, `AccountsAPIs`, or `WorkspaceAPIs`; the shared
`serilogsettings.json` is consumed as a linked file only.

## Run

From this directory, so the service finds its own `.env.local`:

```sh
dotnet run
```

The API listens on port `4004` and serves everything under `/api`, with Swagger at `/swagger`. Startup loads one
committed `appsettings.json`, the shared `serilogsettings.json` linked from `AspNetToolkit/`, an optional
`appsettings.<Environment>.json`, and — in `Localhost` only — the gitignored `.env.local` next to this file, before
Kestrel binds. `dotnet run` applies `Properties/launchSettings.json` first, whose `https://localhost:4004` wins over
`.env.local`; pass `--no-launch-profile` to let the file's `ASPNETCORE_URLS` decide the address.

Values are validated in **every** environment, `Localhost` included: a missing or blank required variable ends startup
with a non-zero exit and `<NAME> environment variable cannot be null or empty`. Secrets are exported per developer in
the shell/session (the same source `AccountsAPIs` and `WorkspaceAPIs` use); none are committed. Non-secret local
overrides belong in the ignored `.env.local`.

| Required                  | Purpose                                                        |
| ------------------------- | -------------------------------------------------------------- |
| `POSTGRESQL_HOST`         | Database host                                                   |
| `POSTGRESQL_USERNAME`     | Database user                                                   |
| `POSTGRESQL_PASSWORD`     | Database password                                               |
| `JWT_SECRET_KEY`          | Shared signing key of `AccountsAPIs` (same value as Accounts)   |

| Optional                  | Default        |
| ------------------------- | -------------- |
| `POSTGRESQL_PORT`         | `5432`         |
| `SMTP_HOST`               | empty          |
| `SMTP_PORT`               | `0`            |
| `SMTP_USER`               | empty          |
| `SMTP_PASSWORD`           | empty          |
| `SMTP_MAIL_FROM_NAME`     | empty          |
| `SMTP_MAIL_FROM_ADDRESS`  | empty          |

Mail settings are optional unless admin notifications are needed. `APP_BASE_URL`, blob storage, data-protection keys,
and on-premises identity values are not read here, and no instance-information call is made at startup.

The database name `GlobalAdminDb` is part of the connection string, so the deployment's Postgres must provide it.

## Sign-in

CRUD routes require the platform session token with the `SA` role (bearer token, or the `AccessToken` cookie). The
token is signed with the Accounts secret and validated without issuer/audience checks, which is why `JWT_SECRET_KEY`
must equal the Accounts value. `metadata` and `validate` take no token: they authenticate with the
`X-OnPrem-Tenant-Id` and `X-OnPrem-Instance-Key` headers, which must name an existing instance that belongs to the
named tenant. Every other route is `/api` + the paths below.

## Database

The service owns an empty database; no data is imported from the previous standalone backend. Migrations in
`Data/Migrations` are the source project's own two migrations (`ga_` prefixed tables, string enums, raw-SQL
performance indexes) and are applied on startup by `SeedInitialData`. To create them by hand:

```sh
cd apis/WorcBackend-legacy/GlobalAdminAPIs
dotnet tool restore
export ASPNETCORE_ENVIRONMENT=Localhost
dotnet ef database update
```

`GlobalAdminDbContextDesignTimeFactory` loads `.env.local` in `Localhost`, then reads `appsettings.json` plus
`POSTGRESQL_*` environment variables for the tooling. New migrations need the EF CLI (`dotnet-ef`); this project's
tool manifest pins `8.0.7` to match the project's EF Core packages, so run `dotnet tool restore` once.

Jenkins also runs `dotnet ef database update` against each target before deploying, in the
`Database migration - Global Admin API` stage. That stage reads `POSTGRESQL_*` from the target's `/etc/environment`,
so `POSTGRESQL_HOST` must be reachable from the Jenkins agent as well as from the target; the service still applies
pending migrations on boot.

## Endpoints

| Area            | Routes                                                                              |
| --------------- | ----------------------------------------------------------------------------------- |
| On-prem tenants | `/api/onprem-tenant` CRUD, `name/{name}`, `search/{name}`, `is-available`, `statistics` |
| Instances       | `/api/onprem/instance` CRUD, `name/{name}`, `search/{name}`, `is-available`, `statistics` |
| Instance data   | `/api/onprem/instance-data` CRUD                                                    |
| Enforcement     | `/api/onprem/instance/metadata`, `/api/onprem/instance/validate`                    |

All CRUD routes are `POST`/`PUT` on the collection, `DELETE /{id}`, `POST /delete-multiple`, `GET /list`, `GET /{id}`.

## Known quirks

Replicated on purpose; the list is the contract, not a backlog to "correct" while porting:

- `OnPremInstanceData` insert discards the posted `validatedOn` and stamps `UtcNow`.
- The tenant insert body field is `outEmails`, which never binds `OurEmails`.
- Insert-instance duplicate-name detection is global, while `is-available` is tenant-scoped.
- Instances have no `IsDisabled` column; the UI switch has no persistence behind it.
- Enforcement answers carry no `SsoAllowed`/`BrandingAllowed`, and `IsValid` is never assigned, so it is always `false`.
  Platform callers ignore `IsValid` and read the missing flags as `false`, exactly as they did against the external
  service.
- Unknown `Source` on `validate` falls back to `BackgroundService`; invalid header traffic sends a rate-limited admin
  email, so `SMTP_*` and `FirstAdminUserEmail` are required even when nobody validates.

The tree also keeps the source's own conventions, which differ from `apis/WorcBackend-legacy/AGENTS.md`: fully
documented members, `bool` bulk-delete results, no `[RequiredGuid]`/route constraints, and the source's file names
(including `IOnPremInstancetRepo.cs` and `CurrentOnPremTenantServicec.cs`). Neither the warning-as-errors setting nor
an `AspNetToolkit` project reference is part of this project.

## Security fixes vs upstream

These are the only intentional behavior deviations from the source tree. Do not revert them to "restore parity" —
each closes a finding from the port's pentest (`PT-*` IDs are in `local-issues/154/`).

- **F1 (`PT-TAUTH-01`)** — the header check rejects at once on every failure with one generic
  `"Authentication failed."` message. The admin alert mail is best effort and never decides the rejection, so a
  throttled alert can no longer let a bad header pair through, and unparseable GUIDs send no mail at all.
- **F2 (`PT-TAUTH-02`)** — a request is rejected unless the instance belongs to the tenant named in the header,
  checked in the filter and again in the validate service.
- **F3 (`PT-METER-03`)** — `validate` rejects an empty `last7DayUsages`, ignores entries dated outside the 7-day
  window (and rejects the request when none is left), clamps per-day increases and the remaining quota at zero, and
  writes usage rows, instance and tenant in a single save.
- **F4 (`PT-ALERT-04`)** — the alert throttle keys on the **last** `X-Forwarded-For` entry (the one nginx appends),
  falls back to the socket peer address, and adds a 5-per-10-minutes burst cap on top of the 12-hour key.
- **F5 (`PT-CRUD-05`)** — SA writes cannot set `OnPremTenantId`, `NoOfInvalidCheck`, `LastValidatedOn` or
  `DeployedOn` on an instance, `CreatedByUser` on a tenant, or `OnPremInstanceId` on an instance-data row; the two
  inserts that need a foreign key set it explicitly.
- **F6 (`PT-DEP-06`)** — the image runs `Production`, so unhandled errors answer with the generic message instead of
  a stack trace.
- **F7 (`PT-MAIL-07`)** — tenant and instance names are HTML-encoded when substituted into the mail templates.

## Provenance

Source tree provenance, verified before the port by matching every file against the Gitea tree API
(`repos/aventisia/GlobalAdminAPIs/git/trees/1eb5d9e...?recursive=1`) and confirmed again afterwards.

Adapted files — the only four:

| File | Change |
| ---- | ------ |
| `Services/Implementions/EmailService.cs` | namespace `AspNetToolkit.Services` → `GlobalAdminAPIs.Services` (the old name collides with `AspNetToolkit`) |
| `Extensions/AppServicesExtension.cs` | dropped the stray `using AspNetToolkit.Services;` |
| `Properties/launchSettings.json` | port `4004` → `4002` → `4004` (source value restored) |
| `appsettings.Localhost.json` | `AppBaseUrl` `localhost:4004` → `localhost:4002` |

Those per-environment setting files, together with this project's separate `serilogsettings.json`, are no longer in the
tree: startup now uses one `appsettings.json` plus environment variables, as described under [Run](#run).

Not carried over: the source's own `GlobalAdminAPIs.sln`, `Jenkinsfile`, `GlobalAdminAPIs.http`, `package-lock.json`,
`.gitignore`, and `.config/dotnet-tools.json` (this project's own manifest pins `dotnet-ef` `8.0.7`).

To re-check, normalize CRLF to LF in each ported file and compare its git blob SHA-1 with the API tree's: expect 72
matches plus these four files matching apart from the lines above.

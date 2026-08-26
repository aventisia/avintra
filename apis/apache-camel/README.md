# Camel Connector Harness

A standalone Spring Boot application for exercising one Apache Camel component at a time through a REST request. The harness accepts a target component URI, request headers, and a body, then dispatches the exchange with Camel `toD` and returns the downstream body and headers. The current build includes SQL, JDBC, HTTP, JMS, File, FTP, Kafka, Mail, GitHub, and Microsoft 365 (Microsoft Graph) connectors.

## Prerequisites

- JDK 17 or newer
- Maven 3.9 or newer
- Docker Desktop with Compose (for Artemis and WireMock)
- An Apache Camel checkout when building a component locally

The adjacent Camel checkout used for this harness is version `4.18.4`. Its `.sdkmanrc` pins Java `17.0.7-tem` and Maven `3.9.9`. On the authoring machine, Docker and Git were available, but Java and Maven were not on `PATH`, so the application could not be compiled here.

On Windows, install a JDK with Windows Package Manager, then open a new PowerShell window:

```powershell
winget install --id EclipseAdoptium.Temurin.17.JDK --exact
```

Set `JAVA_HOME` to the installed JDK directory if the installer does not set it automatically. Maven is bundled through the project wrapper, so a separate Maven installation is unnecessary.

## Windows troubleshooting

If Docker reports `dockerDesktopLinuxEngine` or says that the system cannot find the file, start Docker Desktop and wait until it reports that Docker is running:

```powershell
Start-Process "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe"
docker info
docker compose up -d
```

If the wrapper reports an invalid `JAVA_HOME`, install Temurin 17, open a new PowerShell window, and point the current session at the installed JDK:

```powershell
winget install --id EclipseAdoptium.Temurin.17.JDK --exact

$jdk = Get-ChildItem "C:\Program Files\Eclipse Adoptium" -Directory |
  Where-Object Name -like "jdk-17*" |
  Sort-Object Name -Descending |
  Select-Object -First 1
$env:JAVA_HOME = $jdk.FullName
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
java -version
```

## Run the harness

```powershell
# Start Artemis and WireMock
cd C:\Users\rahmat15\Desktop\Project\Connectors
docker compose up -d

# Start the application after installing/configuring JDK 17
.\mvnw.cmd spring-boot:run
```

The REST endpoint is `POST http://localhost:4004/api/connectors/{connector}`. The connector path must match the URI scheme in `targetUri`; this makes requests easy to identify while retaining the deliberately dynamic nature of the harness.

## JBang YAML runtime

For a lightweight route-only runtime, [rest-dispatch.camel.yaml](rest-dispatch.camel.yaml) provides the dynamic dispatch shape using Camel JBang. It reads the canonical `uri` and `body` fields and loads connector libraries at launch. The current YAML route does not apply arbitrary header maps; use the Spring Boot runtime when request headers or dynamic datasource beans are required:

```powershell
camel run .\rest-dispatch.camel.yaml `
  --dep=org.apache.camel:camel-sql:4.18.4 `
  --dep=org.apache.camel:camel-http:4.18.4 `
  --dep=org.apache.camel:camel-jackson:4.18.4 `
  --dep=org.postgresql:postgresql:42.7.4
```

Use the Spring Boot runtime when you need the built-in JSON response envelope, request-scoped datasource pooling, or the local Artemis bean. Use the JBang route for stateless producer calls where the required component dependencies can be supplied at startup. File, FTP, Kafka, and Mail requests still require a reachable destination or server; adding the starter only makes the Camel scheme available.

## Request parameters

The JSON request supports these fields:

```json
{
  "targetUri": "<complete Camel endpoint URI>",
  "headers": { "<component option or protocol header>": "<value>" },
  "body": "<text, object, array, or null>"
}
```

For PostgreSQL, credentials can be supplied per request with a `db` block. Do not put the password in the Camel URI:

```json
{
  "targetUri": "sql:select * from \"AppSecrets\"",
  "headers": {},
  "body": null,
  "db": {
    "url": "jdbc:postgresql://localhost:5432/secret_manager?sslmode=disable",
    "username": "postgres",
    "password": "Post@123"
  }
}
```

When `db` is present, the harness creates or reuses a pooled datasource and automatically adds `dataSource=#requestDataSource_<fingerprint>` to the SQL URI. The password is never returned in the response.

Put endpoint values such as host, port, database, queue, path, and query parameters in `targetUri`. Put runtime protocol values such as HTTP method, authorization, content type, or component headers in `headers`. For SQL, supply the database URL, username, and password through the `db` block; do not place credentials in the request body or URI.

For HTTP GET and DELETE, set `CamelHttpMethod` and put URL query parameters directly in the URI:

```powershell
curl.exe -X POST http://localhost:4004/api/connectors/http `
  -H "Content-Type: application/json" `
  -d '{\"targetUri\":\"http://localhost:8081/echo?item=42&bridgeEndpoint=true\",\"headers\":{\"CamelHttpMethod\":\"GET\"},\"body\":null}'

curl.exe -X POST http://localhost:4004/api/connectors/http `
  -H "Content-Type: application/json" `
  -d '{\"targetUri\":\"http://localhost:8081/echo?item=42&bridgeEndpoint=true\",\"headers\":{\"CamelHttpMethod\":\"DELETE\"},\"body\":null}'
```

For a database query, put the SQL statement and datasource reference in `targetUri`:

```json
{
  "targetUri": "sql:select id, message from connector_events where id = :#id?dataSource=#dataSource",
  "headers": { "id": 1 },
  "body": null
}
```

## Worked examples

### SQL

```powershell
curl.exe -X POST http://localhost:4004/api/connectors/sql `
  -H "Content-Type: application/json" `
  -d '{\"targetUri\":\"sql:insert into connector_events(message) values (:#message)\",\"headers\":{\"message\":\"hello from curl\"},\"body\":null,\"db\":{\"url\":\"jdbc:postgresql://localhost:5432/your_database\",\"username\":\"your_user\",\"password\":\"your_password\"}}'
```

Expected response includes `"ok":true`. Verify the inserted row with your
database client. When `db` is supplied, the harness registers and selects the
request-specific datasource automatically.

### HTTP / WireMock

```powershell
curl.exe -X POST http://localhost:4004/api/connectors/http `
  -H "Content-Type: application/json" `
  -d '{\"targetUri\":\"http://localhost:8081/echo?bridgeEndpoint=true\",\"headers\":{\"Content-Type\":\"application/json\"},\"body\":{\"message\":\"hello\"}}'
```

Expected response body contains `received: true` and `message: hello`. WireMock is the local downstream service, not the harness itself.

### JMS / Artemis

```powershell
curl.exe -X POST http://localhost:4004/api/connectors/jms `
  -H "Content-Type: application/json" `
  -d '{\"targetUri\":\"jms:queue:connector-tests\",\"body\":\"hello from curl\"}'
```

Expected response includes `"ok":true`. Verify the message in the Artemis console at `http://localhost:8161` or consume it with a JMS client. Artemis credentials are `camel` / `camel`.

### Mail

For Mail, keep SMTP connection settings in `targetUri`, message metadata in `headers`, and the actual message in `body.content`. The harness unwraps `content` before sending it:

```powershell
$mailBody = @'
<html>
  <body style="font-family:Arial,sans-serif;color:#222">
    <h2>Connector test completed</h2>
    <p>The connector test finished successfully.</p>
    <p><strong>Environment:</strong> local</p>
    <p><strong>Result:</strong> ready for review</p>
  </body>
</html>
'@

$request = @{
  targetUri = "smtps://smtp.gmail.com:465?username=$env:GMAIL_USER&password=$env:GMAIL_APP_PASSWORD&mail.smtp.auth=true&mail.smtp.starttls.enable=false"
  headers = @{
    From = $env:GMAIL_USER
    To = 'recipient@example.com'
    Subject = 'Connector test completed'
  }
  body = @{
    contentType = 'text/html'
    content = $mailBody
  }
} | ConvertTo-Json -Compress

curl.exe -X POST http://localhost:4004/api/connectors/mail `
  -H "Content-Type: application/json" `
  -d $request
```

To load the body from a file, save the HTML as `mail-body.html`. Do not send the HTML file itself as the JSON request:

```powershell
$mailBody = Get-Content .\mail-body.html -Raw
$request = @{
  targetUri = "smtps://smtp.gmail.com:465?username=$env:GMAIL_USER&password=$env:GMAIL_APP_PASSWORD&mail.smtp.auth=true&mail.smtp.starttls.enable=false"
  headers = @{
    From = $env:GMAIL_USER
    To = 'recipient@example.com'
    Subject = 'Connector test completed'
  }
  body = @{
    contentType = 'text/html'
    content = $mailBody
  }
} | ConvertTo-Json -Compress

curl.exe -X POST http://localhost:4004/api/connectors/mail `
  -H "Content-Type: application/json" `
  -d $request
```

For Gmail, use an App Password, not the normal account password. Set `$env:GMAIL_USER` and `$env:GMAIL_APP_PASSWORD` in the PowerShell session first. An object without `content`, such as `"body":{"message":"hello"}`, is still treated as JSON text. Save an HTML template as `mail-body.html`, load it with `Get-Content -Raw`, and place the result in `body.content`; do not send the HTML file itself as the JSON request.

## Add another Camel component

1. Add its Spring Boot starter to `pom.xml`, using the same Camel BOM version.
2. Build the component and dependencies from the Camel checkout, not the whole monorepo:

   ```powershell
   cd ..\camel
   .\mvnw.cmd install -pl components\<component-dir> -am -DskipTests
   ```

3. Start only the backend required by that component.
4. Send a request to `/connectors/{connector}` with the component-specific URI and payload.
5. Verify the real side effect, such as a row, message, file, or remote response.

The harness does not need a new route for each component. `toD("${exchangeProperty.targetUri}")` selects the endpoint at runtime.

## Architecture and limitations

- `ConnectorApiRoute` owns one REST DSL route and normalizes the JSON request before dynamic dispatch.
- `BackendConfiguration` provides the local Artemis connection factory; `DynamicDatabaseRegistry` creates pooled datasources from each request's `db` block.
- `docker-compose.yml` provides ActiveMQ Artemis and WireMock. Add a narrowly scoped service when a new connector needs one.
- The endpoint intentionally permits dynamic component URIs. Run it only on a trusted local network; do not expose it as an unprotected production API.
- Generic dispatch cannot solve cloud authentication, OAuth flows, certificates, vendor-specific provisioning, or connectors with multi-step setup. Those need case-by-case test fixtures and credentials.
- The response is a diagnostic envelope, not a component-specific assertion. A successful HTTP call can still mean the downstream system accepted data incorrectly, so always check the backend effect.

## Connector folder structure

Every connector follows the same **Connector → Service → Action** layout across implementation, tests, and Bruno requests:

```
src/main/java/camel/harness/
├── core/                              # shared framework (dispatch, metadata, schema, auth model)
└── connectors/
    └── <connector>/
        ├── auth/ client/ dto/ error/ service/ util/   # role sub-packages for large connectors
        └── .../<action>              # focused per-action tests
src/test/java/camel/harness/
└── connectors/
    └── <connector>/
        ├── <service>/
        │   └── <Action>Test.java     # unit/route tests per service and action
        └── <connector>ConfigurerTest.java
bruno/apache-camel-connectors/
└── <Connector>/
    ├── <service>/
    │   ├── folder.bru
    │   └── <action>.bru
```

- Framework classes (routing, request model, metadata registry, schema, auth types, generic configurer) live in `core`.
- Each connector keeps all of its routes, processors, services, models, and configurers inside `connectors/<name>`.
- Tests and Bruno requests mirror the same service/action hierarchy, so adding an action means adding its implementation, its test, and its Bruno request together.

## Microsoft 365 connector

The `m365` connector exposes Microsoft Graph operations as `direct:m365.<service>.<action>` routes invoked through `POST /connectors/m365` with a dotted `operation` (e.g. `user.get`, `mail.send`, `drivefile.upload`, `teams.clone`). It supports every Microsoft identity / OAuth 2.0 token flow — `client_credentials` (app-only), `authorization_code`, `refresh_token`, `device_code`, and On-Behalf-Of (OBO) — plus pre-generated bearer tokens, centralizes all Graph HTTP/pagination/retry/throttling in a shared client, and ships per-service unit tests plus an embedded-server integration test. The `auth` service family exposes each flow as a connector operation (`auth.get-token`, `auth.authorization-code`, `auth.refresh-token`, `auth.device-code-start`, `auth.device-code-poll`, `auth.on-behalf-of`). See [connectors.md](connectors.md#microsoft-365--microsoft-graph) for the full request format, auth, configuration, and error handling.

Every action carries canonical metadata (description, required Graph permission scopes, inputs/outputs, documented error codes, support status) used to generate a **capability matrix** and per-service references:

- Capability matrix: [docs/m365/capability-matrix.md](docs/m365/capability-matrix.md)
- Per-service action references: [`docs/m365/actions-<service>.md`](docs/m365/)
- Camel capability audit & gap analysis: [docs/m365-capabilities-audit.md](docs/m365-capabilities-audit.md)

Errors are normalized to a stable `errorType` taxonomy (`not_found`, `insufficient_permissions`, `rate_limited`, …) with the Graph `graphCode` and `Retry-After` preserved. The `connectors.yml` operations list is generated from the Java action registry (`M365CatalogGenerator`) and guarded by a consistency test so the catalog never drifts.

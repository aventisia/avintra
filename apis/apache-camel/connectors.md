# Apache Camel Connector Harness — Supported Connectors

This document describes the Camel connector harness. The harness can dispatch to **any Apache Camel component** whose starter is on the classpath. For components without a hand-written configurer, a generic configurer builds a URI from `configuration` fields and injects `auth` options.

For each hand-written connector you will find:

- Connector name and Camel component/URI scheme
- Supported operations
- Required and optional configuration fields
- Authentication requirements
- Sample request and response payloads
- Error response format
- Connector-specific notes and limitations

## JSON Schema Endpoint

The harness exposes JSON Schema endpoints so clients can discover the expected payload for each connector at runtime.

| Endpoint | Description |
|---|---|
| `GET /connectors/{connector}/schema` | JSON Schema for a single connector family |
| `GET /connectors/schemas` | JSON object mapping every connector family to its JSON Schema |

Example:

```bash
curl http://localhost:4005/api/connectors/http/schema
```

## Structured Execute Endpoint

The primary entry point for the .NET Cloud Connector service is the
configuration-driven execute endpoint:

| Endpoint | Description |
|---|---|
| `POST /connectors/execute` | Executes a connector operation from a structured request |

The .NET service maps each connector field to a location (path/query/header/
body/property) using the connector config's per-field `camel` block and sends a
generic request:

```json
{
  "connector": "github",
  "operation": "branch.list",
  "authentication": {
    "type": "accessToken",
    "credential": {
      "name": "GitHubCredential",
      "value": { "token": "ghp_secret" }
    }
  },
  "parameters": {
    "owner": "acme",
    "repo": "widgets"
  },
  "query": {
    "per_page": 20,
    "page": 1
  },
  "headers": {},
  "body": null,
  "properties": {}
}
```

The harness converts this into the internal flat envelope and dispatches to the
appropriate Camel connector. Optional fields are omitted when not provided.

## Common Request Format

Every connector request uses the following JSON envelope. Legacy aliases (`targetUri`, `uri`, `headers`, `body`, `db`) are still accepted.

```json
{
  "connector": "<camel-connector-name>",
  "operation": "<operation-name>",
  "configuration": {
    "<property-1>": "<value>",
    "<property-2>": "<value>"
  },
  "auth": {
    "type": "<auth-type>",
    "username": "<value>",
    "password": "<value>",
    "properties": {
      "<extra-key>": "<value>"
    }
  },
  "headers": {
    "<header-name>": "<value>"
  },
  "payload": {
    "<request-field>": "<sample-value>"
  }
}
```

### Authentication types

| Type | Fields used | Typical connectors |
|---|---|---|
| `none` | — | file, http (public endpoints) |
| `basic` | `username`, `password` | http, ftp, mail, jms |
| `bearer` | `token` | http, kafka |
| `apiKey` | `apiKey`, `apiKeyHeader` | http, github |
| `accessToken` | `token` | github (GitHub PATs) |
| `oauth2` | `clientId`, `clientSecret`, `refreshToken`, `tokenUrl`, `authorizationUrl`, `scopes` | github |
| `database` | `properties.url`, `properties.username`, `properties.password` | sql, jdbc |

For `database` auth, `properties.username`/`properties.password` are optional
when the connection string embeds credentials in the URL userinfo
(`postgresql://user:pass@host/db`). Percent-encoded characters in the userinfo
are decoded automatically, and separately supplied credentials take precedence.
| `aws` | `accessKey`, `secretKey`, `region` | AWS components (when added) |
| `azure` | `tenantId`, `clientId`, `clientSecret`, `subscriptionId` | Azure components (when added) |
| `gcp` | `projectId`, token/service-account | Google components (when added) |

### Response Envelope

#### Success

```json
{
  "success": true,
  "connector": "http",
  "operation": "GET",
  "data": { "message": "hello" },
  "error": null
}
```

#### Error

```json
{
  "success": false,
  "connector": "http",
  "operation": "GET",
  "data": null,
  "error": {
    "code": "CONNECTOR_FAILURE",
    "message": "Connection refused"
  }
}
```

Sensitive credential information is never included in the response.

---

## HTTP / HTTPS

- **Connector name:** `http`
- **Camel URI scheme:** `http`, `https`
- **Supported operations:** `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `HEAD`, `OPTIONS`

### Required configuration

| Field | Description |
|---|---|
| `host` | Hostname or full URL (e.g. `localhost:8081` or `https://api.example.com`) |

### Optional configuration

| Field | Description |
|---|---|
| `path` | URL path appended to the host |
| `httpMethod` | HTTP method; defaults to operation or existing `Exchange.HTTP_METHOD` header |
| `queryParameters` | Map of query parameters to append |

### Authentication

Optional. Use `auth.type`:
- `basic` → `username`, `password`
- `bearer` → `token`
- `apiKey` → `apiKey`, optional `apiKeyHeader`

### Sample request

```json
{
  "connector": "http",
  "operation": "POST",
  "configuration": {
    "host": "localhost:8081",
    "path": "echo",
    "httpMethod": "POST"
  },
  "headers": {
    "Content-Type": "application/json"
  },
  "payload": {
    "message": "hello"
  }
}
```

### Sample response

```json
{
  "ok": true,
  "connector": "http",
  "targetUri": "http://localhost:8081/echo",
  "body": { "message": "hello" },
  "headers": { "Content-Type": "application/json" }
}
```

### Error response

```json
{
  "ok": false,
  "connector": "http",
  "targetUri": "http://unknown-host/echo",
  "error": "Connection refused: no further information",
  "type": "java.net.ConnectException"
}
```

### Notes

- The legacy request format `targetUri=http://localhost:8081/echo` with `body` and `headers` continues to work.
- Secrets should be supplied via the `auth` block, not embedded in the URI.

---

## SQL

- **Connector name:** `sql`
- **Camel URI scheme:** `sql`
- **Supported operations:** `select`, `insert`, `update`, `delete`

### Required configuration

| Field | Description |
|---|---|
| `query` | SQL statement to execute |

### Optional configuration

| Field | Description |
|---|---|
| `useMessageBodyForParameters` | Use payload list as query parameters |
| `outputType` | Camel output type for result sets |

### Authentication

Required when the legacy `db` block is not used. Use `auth.type=database` with:

| Field | Description |
|---|---|
| `properties.url` | JDBC URL (`jdbc:postgresql://...`) **or** URL-style connection string (`postgresql://user:pass@host:port/db`) |
| `properties.username` | Database username (optional when embedded in the URL userinfo) |
| `properties.password` | Database password (optional when embedded in the URL userinfo) |

URL-style connection strings are normalized to JDBC URLs automatically, and
credentials embedded in the URL userinfo (`postgresql://user:pass@host:port/db`)
are extracted when `username`/`password` are not supplied separately. The
userinfo is split on the last `@`, so passwords containing `@` are supported.

Percent-encoded characters in the URL userinfo are decoded before the driver
receives them (e.g. `%40` → `@`, `%25` → `%`). This lets you embed credentials
that contain reserved characters without breaking the URL:

```json
{
  "connector": "sql",
  "operation": "query",
  "configuration": {
    "query": "SELECT * FROM users"
  },
  "auth": {
    "type": "database",
    "properties": {
      "url": "postgresql://user%40domain:p%40ss%25word@localhost:5432/WorkspaceDb"
    }
  }
}
```

Separately supplied `properties.username`/`properties.password` always take
precedence over credentials embedded in the URL userinfo. When only one of them
is missing, the missing value is filled in from the URL userinfo.

### Sample request

```json
{
  "connector": "sql",
  "operation": "select",
  "configuration": {
    "query": "SELECT * FROM users WHERE id = ?"
  },
  "auth": {
    "type": "database",
    "properties": {
      "url": "jdbc:postgresql://localhost:5432/testdb",
      "username": "test",
      "password": "test"
    }
  },
  "payload": [1]
}
```

### Sample request (URL-style connection string)

```json
{
  "connector": "sql",
  "operation": "query",
  "configuration": {
    "query": "SELECT * FROM users"
  },
  "auth": {
    "type": "database",
    "properties": {
      "url": "postgresql://postgres:Post@123@localhost:5432/WorkspaceDb"
    }
  }
}
```

### Sample response

```json
{
  "ok": true,
  "connector": "sql",
  "targetUri": "sql:SELECT%20*%20FROM%20users%20WHERE%20id%20=%20?",
  "body": [[1, "Alice"]],
  "headers": { "breadcrumbId": "..." }
}
```

### Error response

```json
{
  "ok": false,
  "connector": "sql",
  "targetUri": "sql:SELECT%20*%20FROM%20missing_table",
  "error": "ERROR: relation \"missing_table\" does not exist",
  "type": "org.postgresql.util.PSQLException"
}
```

### Notes

- Only PostgreSQL is supported by the dynamic database registry at this time.
- A per-request pooled `HikariDataSource` is created and cached by connection fingerprint.

---

## JDBC

- **Connector name:** `jdbc`
- **Camel URI scheme:** `jdbc`
- **Supported operations:** `execute`

### Required configuration

| Field | Description |
|---|---|
| `dataSourceName` | Name of the `DataSource` bean already bound in the Camel registry |

### Optional configuration

| Field | Description |
|---|---|
| `readSize` | Fetch size for result sets |
| `outputClass` | Class to map result rows |

### Authentication

Use `auth.type=database` to bind a per-request datasource, or pre-register a `DataSource` bean and reference it by `dataSourceName`. As with the SQL connector, credentials may be embedded in the URL userinfo (`postgresql://user:pass@host/db`); percent-encoded characters are decoded automatically and separately supplied `username`/`password` take precedence.

### Sample request

```json
{
  "connector": "jdbc",
  "operation": "execute",
  "configuration": {
    "dataSourceName": "postgresDS"
  },
  "auth": {
    "type": "database",
    "properties": {
      "url": "jdbc:postgresql://localhost:5432/testdb",
      "username": "test",
      "password": "test"
    }
  },
  "payload": "SELECT * FROM users"
}
```

### Sample response

```json
{
  "ok": true,
  "connector": "jdbc",
  "targetUri": "jdbc?dataSource=#requestDataSource_...",
  "body": [[1, "Alice"]],
  "headers": {}
}
```

### Notes

- If a `dataSourceName` is provided, the request datasource registry is bypassed for that endpoint.
- Camel's JDBC component executes raw statements; use SQL component for safer parameterized queries.

---

## File

- **Connector name:** `file`
- **Camel URI scheme:** `file`
- **Supported operations:** `read`, `write`, `append`

### Required configuration

| Field | Description |
|---|---|
| `directoryName` | Base directory on the local filesystem |

### Optional configuration

| Field | Description |
|---|---|
| `fileName` | Target file name |
| `doneFileName` | Done marker file for read operations |
| `flatten` | Flatten directory structure |
| `charset` | Character encoding |

### Authentication

None.

### Sample request

```json
{
  "connector": "file",
  "operation": "write",
  "configuration": {
    "directoryName": "/tmp/camel-harness",
    "fileName": "hello.txt"
  },
  "payload": "Hello from Camel file component"
}
```

### Sample response

```json
{
  "ok": true,
  "connector": "file",
  "targetUri": "file:/tmp/camel-harness?fileName=hello.txt",
  "body": "Hello from Camel file component",
  "headers": { "CamelFileName": "hello.txt" }
}
```

### Notes

- Consumer semantics are not supported by this request/response harness; only producer operations are expected to succeed cleanly.

---

## FTP / SFTP / FTPS

- **Connector name:** `ftp`
- **Camel URI schemes:** `ftp`, `ftps`, `sftp`
- **Supported operations:** `read`, `write`, `append`, `delete`, `list`

### Required configuration

| Field | Description |
|---|---|
| `scheme` | One of `ftp`, `ftps`, `sftp` |
| `host` | FTP server host |
| `directoryName` | Remote directory |

### Optional configuration

| Field | Description |
|---|---|
| `port` | Server port |
| `fileName` | Target file name |
| `passiveMode` | Use passive mode for FTP |
| `binary` | Binary transfer mode |
| `strictHostKeyChecking` | SSH host key checking for SFTP |

### Authentication

Optional but common. Use `auth.type=basic` with `username` and `password`. For SFTP key auth, put the private key path in `auth.properties.privateKey`.

### Sample request

```json
{
  "connector": "ftp",
  "operation": "write",
  "configuration": {
    "scheme": "sftp",
    "host": "localhost",
    "port": 2222,
    "directoryName": "upload"
  },
  "auth": {
    "type": "basic",
    "username": "ftpuser",
    "password": "ftppass"
  },
  "payload": "SFTP file content"
}
```

### Sample response

```json
{
  "ok": true,
  "connector": "ftp",
  "targetUri": "sftp://localhost:2222/upload?username=ftpuser&password=ftppass",
  "body": "SFTP file content",
  "headers": {}
}
```

### Notes

- SFTP key-based auth is not fully implemented in the current configurer; the private key path is accepted but must match the Camel SFTP component option names in future updates.

---

## JMS

- **Connector name:** `jms`
- **Camel URI scheme:** `jms`
- **Supported operations:** `send`, `request`, `browse`

### Required configuration

| Field | Description |
|---|---|
| `destinationName` | Queue or topic name |

### Optional configuration

| Field | Description |
|---|---|
| `deliveryMode` | `PERSISTENT` or `NON_PERSISTENT` |
| `timeToLive` | Message TTL in milliseconds |
| `replyTo` | Reply destination for request/reply |

### Authentication

Optional. Use `auth.type=basic` with:

| Field | Description |
|---|---|
| `properties.brokerUrl` | Broker URL, e.g. `tcp://localhost:61616` |
| `username` | Broker username |
| `password` | Broker password |

### Sample request

```json
{
  "connector": "jms",
  "operation": "send",
  "configuration": {
    "destinationName": "orders"
  },
  "auth": {
    "type": "basic",
    "username": "camel",
    "password": "camel",
    "properties": {
      "brokerUrl": "tcp://localhost:61616"
    }
  },
  "payload": { "orderId": "ORD-123" }
}
```

### Sample response

```json
{
  "ok": true,
  "connector": "jms",
  "targetUri": "jms:orders?connectionFactory=#jmsConnectionFactory_...",
  "body": { "orderId": "ORD-123" },
  "headers": { "JMSDestination": "orders" }
}
```

### Notes

- A per-request ActiveMQ Artemis `ConnectionFactory` is created and bound to the Camel registry when broker credentials differ from the default.
- The legacy hardcoded `tcp://localhost:61616` factory still exists but is no longer required.

---

## Kafka

- **Connector name:** `kafka`
- **Camel URI scheme:** `kafka`
- **Supported operations:** `send`, `poll`, `fetch`

### Required configuration

| Field | Description |
|---|---|
| `topic` | Kafka topic name |
| `brokers` | Bootstrap servers, e.g. `localhost:9092` |

### Optional configuration

| Field | Description |
|---|---|
| `groupId` | Consumer group id |
| `key` | Record key |
| `partitionKey` | Partition to send to |
| `autoCommitEnable` | Auto-commit offsets |

### Authentication

Optional. Use `auth.type=basic` for SASL/PLAIN or `auth.type=bearer` for OAuth. Additional properties may be passed in `auth.properties`.

### Sample request

```json
{
  "connector": "kafka",
  "operation": "send",
  "configuration": {
    "topic": "events",
    "brokers": "localhost:9092",
    "key": "order-123"
  },
  "auth": {
    "type": "basic",
    "username": "kafka",
    "password": "kafka"
  },
  "payload": { "status": "created" }
}
```

### Sample response

```json
{
  "ok": true,
  "connector": "kafka",
  "targetUri": "kafka:events?brokers=localhost:9092&key=order-123",
  "body": { "status": "created" },
  "headers": { "kafka.TOPIC": "events" }
}
```

### Notes

- The harness is producer-oriented; `poll`/`fetch` will only work if the Kafka component can complete a synchronous exchange.
- SASL/SSL properties are built from the auth block; complex SSL truststore configuration should be supplied via `auth.properties`.

---

## Sample JSON Schema

Below is the schema returned by `GET /connectors/http/schema`.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "title": "ConnectorRequest",
  "description": "Request payload for the Camel connector harness",
  "required": ["connector", "operation", "configuration"],
  "properties": {
    "connector": { "type": "string", "description": "Connector family name", "enum": ["http", "https"] },
    "operation": { "type": "string", "description": "Operation to execute", "enum": ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"] },
    "configuration": {
      "type": "object",
      "description": "Connector-specific URI and option configuration",
      "required": ["host"],
      "properties": {
        "host": { "type": "string", "description": "Required: host" },
        "path": { "type": "string", "description": "Optional: path" },
        "httpMethod": { "type": "string", "description": "Optional: httpMethod" }
      }
    },
    "auth": {
      "type": "object",
      "description": "Authentication configuration",
      "properties": {
        "type": { "type": "string", "enum": ["none", "basic", "bearer", "apiKey", "database", "aws", "azure", "gcp"] },
        "username": { "type": "string" },
        "password": { "type": "string" },
        "token": { "type": "string" },
        "apiKey": { "type": "string" },
        "apiKeyHeader": { "type": "string" }
      }
    },
    "headers": { "type": "object", "description": "HTTP-style headers to pass to the Camel exchange" },
    "payload": { "description": "Request body or component-specific payload" }
  }
}
```

---

## Mail (SMTP / SMTPS / IMAP / POP3)

- **Connector name:** `mail`
- **Camel URI schemes:** `smtp`, `smtps`, `imap`, `imaps`, `pop3`, `pop3s`
- **Supported operations:** `send`, `read`, `search`, `delete`

### Required configuration

| Field | Description |
|---|---|
| `host` | Mail server host |
| `to` | Recipient address (for send) |

### Optional configuration

| Field | Description |
|---|---|
| `scheme` | `smtp`, `smtps`, `imap`, `imaps`, `pop3`, `pop3s` |
| `port` | Server port |
| `subject` | Email subject |
| `from` | Sender address |
| `contentType` | `text/plain`, `text/html`, or `text`/`html` shorthand |

### Authentication

Optional. Use `auth.type=basic` with `username` and `password`.

### Sample request

```json
{
  "connector": "mail",
  "operation": "send",
  "configuration": {
    "scheme": "smtp",
    "host": "smtp.example.com",
    "port": 587,
    "to": "receiver@example.com",
    "subject": "Test email",
    "contentType": "text/plain"
  },
  "auth": {
    "type": "basic",
    "username": "sender@example.com",
    "password": "app-password"
  },
  "payload": "Hello from Camel mail component"
}
```

### Sample response

```json
{
  "ok": true,
  "connector": "mail",
  "targetUri": "smtp://smtp.example.com:587",
  "body": "Hello from Camel mail component",
  "headers": { "CamelMailTo": "receiver@example.com" }
}
```

### Notes

- `to`, `from`, and `subject` can also be supplied via `headers.To`, `headers.From`, and `headers.Subject`.
- Avoid putting passwords in the URI; use the `auth` block.

---

## GitHub

- **Connector name:** `github`
- **Camel URI scheme:** `github` (routes are `direct:github.<service>.<action>`)
- **Supported operations:** `repository.*`, `branch.*`, `commit.*`, `file.*`, `pullrequest.*`, `pullrequest.review.*`, `issue.*`, `issue.label.*`, `issue.comment.*`, `release.*`, `release.asset.*`, `tag.*`, `workflow.*`, `workflow.run.*`, `organization.*`, `user.*`, `webhook.*`, `webhook.event.*`, `search.*`, `notification.*` (see `GET /connectors/github/schema` for the full list)

### Request format

The `operation` is the dotted service + action, e.g. `repository.create` or `pullrequest.merge`. Path parameters are supplied in `configuration`:

```json
{
  "connector": "github",
  "operation": "repository.create",
  "configuration": {
    "baseUrl": "https://api.github.com",
    "name": "my-new-repo",
    "description": "Created via harness",
    "private": true
  },
  "auth": { "type": "accessToken", "token": "{{GITHUB_TOKEN}}" },
  "payload": { "name": "my-new-repo", "description": "Created via harness", "private": true }
}
```

For actions with path parameters, provide them in `configuration`:

```json
{
  "connector": "github",
  "operation": "pullrequest.review.submit-review",
  "configuration": { "owner": "acme", "repo": "demo", "number": "42" },
  "auth": { "type": "accessToken", "token": "{{GITHUB_TOKEN}}" },
  "payload": { "body": "Looks good", "event": "APPROVE" }
}
```

### Authentication

Required for most actions (public read-only endpoints work unauthenticated). Use `auth.type`:

- `accessToken` → `token` (GitHub PAT / fine-grained token)
- `apiKey` → `apiKey`, optional `apiKeyHeader` (defaults to `Authorization: Bearer`)
- `oauth2` → `clientId`, `clientSecret`; optional `refreshToken`, `authorizationUrl`, `tokenUrl`, `scopes`. Access tokens are acquired from the token endpoint, cached, and refreshed automatically on expiry or 401.

Credentials may also be supplied via application properties/environment (`github.auth.token`, `github.auth.client-id`, `github.auth.client-secret`, `github.auth.refresh-token`, `github.base-url`, `github.webhook.secret`). Secrets are never echoed in responses or logs.

### Configuration

| Field | Description |
|---|---|
| `baseUrl` | Overrides the default `https://api.github.com` (GitHub Enterprise) |
| `owner`, `repo`, `branch`, `number`, `ref`, `base`, `head`, `path`, `org`, `username`, `tag`, `name`, `commentId`, `reviewId`, `deliveryId`, `assetId`, `attemptNumber`, `workflowId`, `runId`, `releaseId`, `hookId` | Path parameters used by the target operation |
| `q` | Search query (search operations) |
| `per_page`, `page`, `since`, `until`, `milestone` | Query parameters honored by the target operation |
| `maxPages` | Cap for automatic pagination aggregation (default 5) |
| `contentType` | Override the `Content-Type` header when sending a payload |

`file.delete` resolves the file's current `sha` automatically (it fetches the file via the contents API first), so the `sha` in the payload is optional — supply it only if you want to override, e.g. to delete a specific blob version. `commit.list-files` fetches the commit and extracts its `files` array automatically (GitHub has no dedicated "list files for commit" endpoint).

### Sample response

```json
{
  "ok": true,
  "connector": "github",
  "targetUri": "direct:github.repository.create",
  "body": { "id": 123, "full_name": "acme/demo", "private": false },
  "headers": { "Github-Status": 201 }
}
```

### Error response

```json
{
  "ok": false,
  "connector": "github",
  "targetUri": "direct:github.repository.get",
  "error": "GitHub API error HTTP 404: Not Found",
  "type": "GithubApiException"
}
```

HTTP status is preserved (401 auth failure, 404 not found, 429 rate limit, etc.). Rate-limit responses include the retry hint.

### Notes

- Every action is exposed as a `direct:github.<service>.<action>` route, auto-registered from the action descriptor registry ([GithubActions.java](src/main/java/camel/harness/connectors/github/GithubActions.java)).
- Adding a new action is a one-liner in the descriptor registry; routes, schema, and tests derive from it.
- `webhook.event.*` actions are local: `receive` accepts a delivery, `verify` validates `X-Hub-Signature-256` (HMAC-SHA256), and `route-event` dispatches by the `X-GitHub-Event` header. The harness does not host an inbound listener.

---

## Microsoft 365 / Microsoft Graph

- **Connector name:** `m365`
- **Camel URI scheme:** `m365` (routes are `direct:m365.<service>.<action>`)
- **Supported operations:** `auth.*`, `user.*`, `group.*`, `mail.*`, `mailfolder.*`, `mailattachment.*`, `calendar.*`, `calendarevent.*`, `calendarattendee.*`, `contact.*`, `drive.*`, `drivefile.*`, `drivepermission.*`, `sharepointsite.*`, `sharepointlist.*`, `sharepointlistitem.*`, `sharepointdrive.*`, `teams.*`, `teamschannel.*`, `teamsmember.*`, `teamsmessage.*`, `teamschat.*`, `teamschatmember.*`, `teamsmeeting.*`, `teamscall.*`, `onedrive.*`, `directory.*`, `organization.*`, `device.*`, `application.*`, `serviceprincipal.*`, `presence.*`, `planner.*`, `todo.*`, `search.*`, `notification.*`, `subscription.*`, `auditreport.*` (see `GET /connectors/m365/schema` for the full list)

### Get an access token (app-only, no user)

`auth.get-token` obtains a Microsoft Graph access token via the OAuth 2.0 `client_credentials` grant — app-only, with **no user id, no user context, and no delegated permissions** required. This is ideal for background/service workloads that act on behalf of the application rather than a user.

Credentials are supplied through the `auth` block (preferred) or via `configuration` (`tenantId`, `clientId`, `clientSecret`, optional `tokenUrl`/`scopes`); environment properties (`m365.auth.*`) are used as fallback:

```json
{
  "connector": "m365",
  "operation": "auth.get-token",
  "configuration": { "baseUrl": "{{M365_BASE_URL}}" },
  "auth": {
    "type": "client_credentials",
    "tenantId": "{{M365_TENANT_ID}}",
    "clientId": "{{M365_CLIENT_ID}}",
    "clientSecret": "{{M365_CLIENT_SECRET}}",
    "tokenUrl": "{{M365_TOKEN_URL}}",
    "scopes": "{{M365_SCOPES}}"
  },
  "payload": null
}
```

The response returns the safe token fields only (never the client secret): `access_token`, `token_type`, `expires_in`, `scope`, `cached` (whether the token came from the in-memory cache), and `grant`. Tokens are cached per client identity and refreshed on expiry, exactly like the OAuth used by the other M365 actions.

### All authentication flows

The `auth` service family exposes every supported Microsoft identity / OAuth 2.0 token-generation flow as a connector operation. Each returns the safe token fields (`access_token`, `token_type`, `expires_in`, `scope`, `cached`, `grant`) and never echoes the client secret:

| Operation | Flow | Key `auth` fields |
|---|---|---|
| `auth.get-token` | `client_credentials` (app-only, no user) | `tenantId`, `clientId`, `clientSecret`, `tokenUrl`, `scopes` |
| `auth.authorization-code` | `authorization_code` (user consent via redirect) | `clientId`, `clientSecret`, `authorizationCode`, `redirectUri`, `tokenUrl`, `scopes` |
| `auth.refresh-token` | `refresh_token` (rotate a refresh token) | `clientId`, `clientSecret`, `refreshToken`, `tokenUrl`, `scopes` |
| `auth.device-code-start` | `device_code` (start; returns `user_code` + `verification_uri`) | `clientId`, `tokenUrl`, `scopes` |
| `auth.device-code-poll` | `device_code` (poll until the user signs in) | `clientId`, `deviceCode`, `tokenUrl` |
| `auth.on-behalf-of` | `on_behalf_of` / OBO (exchange a caller JWT) | `clientId`, `clientSecret`, `assertion`, `tokenUrl`, `scopes` |

Example — authorization-code grant:

```json
{
  "connector": "m365",
  "operation": "auth.authorization-code",
  "configuration": { "baseUrl": "{{M365_BASE_URL}}" },
  "auth": {
    "type": "authorization_code",
    "tenantId": "{{M365_TENANT_ID}}",
    "clientId": "{{M365_CLIENT_ID}}",
    "clientSecret": "{{M365_CLIENT_SECRET}}",
    "authorizationCode": "{{M365_AUTHORIZATION_CODE}}",
    "redirectUri": "{{M365_REDIRECT_URI}}",
    "tokenUrl": "{{M365_TOKEN_URL}}",
    "scopes": "{{M365_SCOPES}}"
  },
  "payload": null
}
```

Example — device-code flow (two steps):

```json
{
  "connector": "m365",
  "operation": "auth.device-code-start",
  "configuration": { "baseUrl": "{{M365_BASE_URL}}" },
  "auth": {
    "type": "device_code",
    "tenantId": "{{M365_TENANT_ID}}",
    "clientId": "{{M365_CLIENT_ID}}",
    "tokenUrl": "{{M365_TOKEN_URL}}",
    "scopes": "{{M365_SCOPES}}"
  },
  "payload": null
}
```

`auth.device-code-start` returns `device_code`, `user_code`, `verification_uri`, `expires_in`, and `interval`. The caller shows the user the code/URI, then polls `auth.device-code-poll` (passing `deviceCode` in `configuration` or `auth.deviceCode`) until the token is issued. While the user has not yet signed in, the poll returns a sanitized `authorization_pending` error so the caller can retry after `interval` seconds.

Example — On-Behalf-Of (OBO):

```json
{
  "connector": "m365",
  "operation": "auth.on-behalf-of",
  "configuration": { "baseUrl": "{{M365_BASE_URL}}" },
  "auth": {
    "type": "on_behalf_of",
    "tenantId": "{{M365_TENANT_ID}}",
    "clientId": "{{M365_CLIENT_ID}}",
    "clientSecret": "{{M365_CLIENT_SECRET}}",
    "assertion": "{{M365_ASSERTION}}",
    "tokenUrl": "{{M365_TOKEN_URL}}",
    "scopes": "{{M365_SCOPES}}"
  },
  "payload": null
}
```

The same flows are available as `auth.type` on **any** M365 action (e.g. `user.get` with `auth.type=authorization_code`), so a token obtained by one flow can be reused across the whole collection. The Bruno collection ships a ready-to-use example for every flow under `M365/Auth/`.

### Request format

The `operation` is the dotted service + action, e.g. `user.get` or `mail.send`. Path parameters are supplied in `configuration`:

```json
{
  "connector": "m365",
  "operation": "user.get",
  "configuration": { "userId": "alex@contoso.com", "$select": "id,displayName,mail" },
  "auth": { "type": "accessToken", "token": "{{M365_TOKEN}}" },
  "payload": null
}
```

Create/update/action operations use `payload` for the Graph request body:

```json
{
  "connector": "m365",
  "operation": "calendarevent.create",
  "configuration": { "userId": "alex@contoso.com" },
  "auth": { "type": "accessToken", "token": "{{M365_TOKEN}}" },
  "payload": {
    "subject": "Planning",
    "start": { "dateTime": "2026-09-01T09:00:00", "timeZone": "UTC" },
    "end": { "dateTime": "2026-09-01T10:00:00", "timeZone": "UTC" }
  }
}
```

### Authentication

Required for all actions (Microsoft Graph has no anonymous access). Use `auth.type`:

- `accessToken` (or `bearer`) → `token` — a pre-generated Microsoft Graph bearer token.
- `oauth2` → `tenantId`, `clientId`, `clientSecret`; optional `refreshToken`, `tokenUrl`, `scopes`. Acquires/refreshes a token from the Microsoft Entra ID token endpoint, caches it, and refreshes on expiry or 401.
- `client_credentials` → `tenantId`, `clientId`, `clientSecret` — app-only access (uses `.default` scope unless `scopes` is set).
- `authorization_code` → `clientId`, `clientSecret`, `authorizationCode`, `redirectUri` — OAuth 2.0 authorization-code grant.
- `refresh_token` → `clientId`, `clientSecret`, `refreshToken` — OAuth 2.0 refresh-token grant.
- `device_code` → `clientId`, `deviceCode` — OAuth 2.0 device-code flow (start with `auth.device-code-start`, then poll `auth.device-code-poll`).
- `on_behalf_of` → `clientId`, `clientSecret`, `assertion` — OAuth 2.0 On-Behalf-Of (OBO) flow.
- `apiKey` → only supported against an optional API-key gateway proxy (`apiKey`, `apiKeyHeader`). Microsoft Graph itself does not accept API keys.

Credentials may also be supplied via application properties/environment (`m365.auth.token`, `m365.auth.client-id`, `m365.auth.client-secret`, `m365.auth.tenant-id`, `m365.auth.refresh-token`, `m365.auth.authorization-code`, `m365.auth.redirect-uri`, `m365.auth.device-code`, `m365.auth.assertion`, `m365.auth.token-url`, `m365.base-url`). Secrets are never echoed in responses or logs.

### Configuration

| Field | Description |
|---|---|
| `baseUrl` | Overrides the default `https://graph.microsoft.com/v1.0` (e.g. national/test clouds) |
| `userId`, `userPrincipalName` | The user whose mailbox/calendar/tasks to operate on. `userPrincipalName` is an accepted alias for `userId` (e.g. an email address). For user-scoped operations (`mail.*`, `calendarevent.*`, `todo.*`, `contact.*`, ...) with a **delegated (user) token**, both may be omitted and the connector targets `/me`; with a **client-credentials (app-only) token** at least one is required because app tokens have no user context. |
| `groupId`, `messageId`, `mailFolderId`, `attachmentId`, `calendarId`, `eventId`, `contactId`, `driveId`, `itemId`, `parentId`, `filename`, `permissionId`, `siteId`, `listId`, `teamId`, `channelId`, `membershipId`, `chatId`, `meetingId`, `callId`, `applicationId`, `servicePrincipalId`, `deviceId`, `organizationId`, `planId`, `taskId`, `subscriptionId`, `appRoleAssignmentId`, `q`, `period`, `query` | Path parameters used by the target operation |
| `authorizationCode`, `redirectUri`, `deviceCode`, `assertion` | OAuth flow inputs for the `auth.*` operations (also accepted in the `auth` block) |
| `$filter`, `$select`, `$expand`, `$orderby`, `$top`, `$skiptoken`, `$search` | OData system query options passed through to Graph |
| `maxPages` | Cap for automatic `@odata.nextLink` pagination (default 5) |
| `autoPaginate` | Set `true` to follow `@odata.nextLink` for list operations |
| `contentType` | Override the `Content-Type` header when sending a payload |

### Sample response

```json
{
  "ok": true,
  "connector": "m365",
  "targetUri": "direct:m365.user.get",
  "body": { "id": "u1", "displayName": "Alex", "userPrincipalName": "alex@contoso.com" },
  "headers": { "M365-Status": 200 }
}
```

### Error response

```json
{
  "ok": false,
  "connector": "m365",
  "targetUri": "direct:m365.user.get",
  "error": "User not found",
  "type": "M365ApiException",
  "errorType": "not_found",
  "graphCode": "Request_ResourceNotFound"
}
```

Every failure carries a **canonical `errorType`** (stable, snake_case) in addition
to the Graph HTTP status and provider message. The taxonomy:

| `errorType` | Meaning | Typical HTTP |
| ----------- | ------- | ------------ |
| `invalid_input` | Request failed validation before reaching Graph | 400 |
| `missing_parameter` | A required path/configuration parameter was not supplied | 400 |
| `authentication_failed` | Token missing, expired, or invalid | 401 |
| `insufficient_permissions` | Token valid but lacks the required permission | 403 |
| `not_found` | The requested resource does not exist | 404 |
| `conflict` | The operation conflicts with current state | 409/412 |
| `rate_limited` | Graph throttling (honors `Retry-After`) | 429/503 |
| `provider_error` | Graph returned a non-success error body | 4xx/5xx |
| `network_error` | Connect/DNS/TLS failure | — |
| `timeout` | Operation exceeded its allowed time | — |
| `unsupported_operation` | Operation not implemented by this connector | — |
| `unknown` | Anything not otherwise classified | — |

When available the envelope also includes `graphCode` (Microsoft Graph
`error.code`) and `retryAfterSeconds` (for `rate_limited`). HTTP status is
preserved (401 auth failure, 404 not found, 403 insufficient permission, 409
conflict, 412 precondition, 429 throttling, 5xx transient, etc.). Throttling
(429/503) is retried with backoff honoring `Retry-After`; transient 500/502/504
are retried with exponential backoff. Credentials and tokens are never echoed.

### Capability matrix & action reference

The full, auto-generated capability matrix (every action with method + path,
inputs, outputs, and required Graph permission scopes) and per-service action
references are generated from the action registry:

- **Capability matrix:** [docs/m365/capability-matrix.md](docs/m365/capability-matrix.md)
- **Per-service references:** [`docs/m365/actions-<service>.md`](docs/m365/)
- **Capability audit (Camel component inventory + gap analysis):**
  [docs/m365-capabilities-audit.md](docs/m365-capabilities-audit.md)

Regenerate them after changing the action catalog:

```
mvnw exec:java -Dexec.mainClass=camel.harness.connectors.m365.tool.M365DocsGenerator
```

### Notes

- Every action is exposed as a `direct:m365.<service>.<action>` route, auto-registered from the action descriptor registry ([M365Actions.java](src/main/java/camel/harness/connectors/m365/M365Actions.java)).
- The `operations:` list in this file is **generated** from `M365Actions` by
  [M365CatalogGenerator.java](src/main/java/camel/harness/connectors/m365/tool/M365CatalogGenerator.java);
  a consistency test fails if the two ever drift.
- All routes funnel through the shared `M365Client` ([M365Client.java](src/main/java/camel/harness/connectors/m365/M365Client.java)); authentication is centralized in `M365AuthService` — no per-route auth logic.
- Complex multi-step operations (e.g. `user.assign-license`, `mail.send`, `mailattachment.add`, `calendarattendee.add/update/remove`, `search.*`) delegate to thin domain services.
- `$select`/`$expand`/`$filter` etc. are passed through as query parameters from `configuration`.
- Binary endpoints (`mailattachment.download`, `drivefile.download`, `onedrive.download`) return base64-encoded content in the envelope.
- The harness does not host webhook/change-notification delivery; `subscription.*` covers subscription lifecycle only.

---

## Supporting All ~350 Apache Camel Components

The harness is designed so any Camel component can be used, not only the hand-written ones below.

### How it works

1. **Camel Catalog loader** ([CamelCatalogMetadataLoader.java](src/main/java/camel/harness/CamelCatalogMetadataLoader.java)) reads the official Apache Camel Catalog and exposes metadata for every published component.
2. **Metadata merge** ([ConnectorMetadataRegistry.java](src/main/java/camel/harness/ConnectorMetadataRegistry.java)) merges hand-written YAML entries with catalog-derived metadata; YAML overrides catalog entries for fields like `operations` and auth requirements.
3. **Generic configurer** ([GenericConfigurer.java](src/main/java/camel/harness/GenericConfigurer.java)) handles any component that does not have a hand-written configurer, building a URI from `configuration` fields and `auth` properties.
4. **Schema generator** ([ConnectorSchemaGenerator.java](src/main/java/camel/harness/ConnectorSchemaGenerator.java)) generates a JSON Schema for every known component on demand.

### Build-time dependency model

Because Spring Boot cannot load new starters at runtime, you choose which connector groups to include at build time. The recommended approach is Maven profiles or a multi-module project.

| Profile idea | Components |
|---|---|
| `core` | http, sql, jdbc, file, ftp, jms, kafka, mail |
| `cloud` | aws2-s3, azure-storage-blob, google-storage |
| `messaging` | amqp, paho, rabbitmq, rocketmq |
| `social` | telegram, slack, discord |

To add a connector, add its starter to [pom.xml](pom.xml), then optionally add a hand-written configurer if it needs special auth or body shaping. If no configurer exists, the generic configurer still dispatches it.

### Consumer-only components

Some components are normally consumers (`timer`, `scheduler`, `direct`, `seda`, `stream`, etc.). In this request/response harness they can still be invoked as producers where Camel allows it, but polling or long-lived consumer semantics are out of scope.

### Adding a New Connector

1. Add the corresponding `org.apache.camel.springboot:camel-{component}-starter` dependency to [pom.xml](pom.xml) (or a Maven profile).
2. Optionally add a metadata entry to [src/main/resources/connectors.yml](src/main/resources/connectors.yml) for operations and auth requirements.
3. Optionally implement a `ConnectorConfigurer` bean for special auth/body handling.
4. Update this document and the [Bruno collection](bruno/apache-camel-connectors) with request samples (regenerate it with `node bruno/generate-collection.mjs`).
5. Run `./mvnw.cmd clean verify` to compile and test.

The harness will automatically discover the new configurer via Spring and route matching requests through it.

---

## JSON Schema

The harness exposes JSON Schema endpoints so clients can discover the expected payload for each connector at runtime.

| Endpoint | Description |
|---|---|
| `GET /connectors/{connector}/schema` | JSON Schema for a single connector family |
| `GET /connectors/schemas` | JSON object mapping every connector family to its JSON Schema |

Example:

```bash
curl http://localhost:4005/api/connectors/http/schema
```


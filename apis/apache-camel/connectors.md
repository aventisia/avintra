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

## Minimal Contract Endpoints

The recommended contract returns only consumer-relevant fields. Camel-internal
metadata, endpoint URIs, class names, and verbose execution details are excluded.

| Endpoint | Description |
|---|---|
| `GET /connectors/` | List every available connector family (`id`, `name`, optional `description`) |
| `GET /connectors/{connector}/operations` | List the operations for a connector (`id`, `name`, optional `description`) |
| `GET /connectors/{connector}/operations/{operation}/schema` | Minimal request schema for a single operation (only `name`, `type`, `required`, `description` per field) |
| `POST /connectors/{connector}/operations/{operation}/execute` | Execute an operation; the request body is exactly the schema fields (flat JSON object) |

Example — list connectors:

```bash
curl http://localhost:4005/api/connectors/
```

Example — list operations for a connector:

```bash
curl http://localhost:4005/api/connectors/aws2-s3/operations
```

Example — fetch the minimal request schema for one operation:

```bash
curl http://localhost:4005/api/connectors/http/operations/GET/schema
```

The schema response is a flat field list:

```json
{
  "connector": "http",
  "operation": "GET",
  "fields": [
    { "name": "operation", "type": "string", "required": true, "description": "Operation to execute (pinned to GET)" },
    { "name": "host", "type": "string", "required": true, "description": "Required: host" },
    { "name": "payload", "type": "any", "required": false, "description": "Request body or component-specific payload" }
  ]
}
```

Example — execute an operation with exactly the schema fields:

```bash
curl -X POST http://localhost:4005/api/connectors/log/operations/info/execute \
  -H "Content-Type: application/json" \
  -d '{"body":"hello from minimal execute"}'
```

The execute request body is a flat JSON object whose fields match the schema.
An optional nested `auth` object and a `payload` field are supported; everything
else is treated as connector configuration.

## Legacy JSON Schema Endpoint

The harness also exposes full JSON Schema endpoints for backward compatibility.

| Endpoint | Description |
|---|---|
| `GET /connectors/{connector}/schema` | Full JSON Schema for a single connector family |
| `GET /connectors/schemas` | JSON object mapping every connector family to its full JSON Schema |

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
  "connector": "http",
  "operation": "GET",
  "authentication": {
    "type": "bearer",
    "credential": {
      "name": "HttpCredential",
      "value": { "token": "secret" }
    }
  },
  "parameters": {
    "host": "localhost:8081",
    "path": "echo"
  },
  "query": {
    "item": 42
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
| `apiKey` | `apiKey`, `apiKeyHeader` | http |
| `accessToken` | `token` | http (bearer-style APIs) |
| `oauth2` | `clientId`, `clientSecret`, `refreshToken`, `tokenUrl`, `authorizationUrl`, `scopes` | http |
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
- `basic` â†’ `username`, `password`
- `bearer` â†’ `token`
- `apiKey` â†’ `apiKey`, optional `apiKeyHeader`

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
receives them (e.g. `%40` â†’ `@`, `%25` â†’ `%`). This lets you embed credentials
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

## Supporting All ~350 Apache Camel Components

The harness is designed so any Camel component can be used, not only the hand-written ones below.

### How it works

1. **Camel Catalog loader** ([CamelCatalogMetadataLoader.java](src/main/java/camel/harness/core/CamelCatalogMetadataLoader.java)) reads the official Apache Camel Catalog and exposes metadata for every published component.
2. **Metadata merge** ([ConnectorMetadataRegistry.java](src/main/java/camel/harness/core/ConnectorMetadataRegistry.java)) merges hand-written YAML entries with catalog-derived metadata; YAML overrides catalog entries for fields like `operations` and auth requirements.
3. **Generic configurer** ([GenericConfigurer.java](src/main/java/camel/harness/core/GenericConfigurer.java)) handles any component that does not have a hand-written configurer, building a URI from `configuration` fields and `auth` properties.
4. **Schema generator** ([ConnectorSchemaGenerator.java](src/main/java/camel/harness/core/ConnectorSchemaGenerator.java)) generates a JSON Schema for every known component on demand.

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


# Camel Connector Harness

A standalone Spring Boot application for exercising one Apache Camel component at a time through a REST request. The harness accepts a target component URI, request headers, and a body, then dispatches the exchange with Camel `toD` and returns the downstream body and headers.

Camel component connectors on the classpath:

- `sql`, `jdbc` — PostgreSQL (per-request datasource pooling via HikariCP)
- `http`, `https` — HTTP/HTTPS client
- `jms` — ActiveMQ Artemis
- `file`, `ftp` — local and remote file systems
- `kafka` — Kafka producer
- `mail` — SMTP/SMTPS

The harness can also dispatch to any other Camel component whose Spring Boot starter is added to `pom.xml`. Hand-written service connectors (GitHub, Microsoft 365) are not yet fully integrated and are intentionally omitted from this document.

## Table of contents

- [Prerequisites](#prerequisites)
- [Project configuration](#project-configuration)
- [Start the harness](#start-the-harness)
- [REST API](#rest-api)
- [Request format](#request-format)
- [Worked examples](#worked-examples)
- [JBang YAML runtime](#jbang-yaml-runtime)
- [Add another Camel component](#add-another-camel-component)
- [Connector code layout](#connector-code-layout)
- [Architecture and limitations](#architecture-and-limitations)
- [Deployment](#deployment)
- [API tests](#api-tests)

## Prerequisites

- JDK 17 or newer
- Maven 3.9 or newer (the project wrapper also supplies Maven)
- Docker Desktop with Compose (for ActiveMQ Artemis and WireMock)
- An Apache Camel checkout when building a custom component locally

### Linux (Ubuntu/Debian)

Update the package index and install OpenJDK 21 plus Maven 3.9:

```bash
sudo apt update
sudo apt install openjdk-21-jdk maven
```

> **Note:** the project source is compiled with `javac`, so the **JDK** is required. A JRE alone is not enough to build. If this machine only runs an already-built JAR, `openjdk-21-jre` is sufficient.

The Ubuntu-packaged Maven is 3.8.x, but the project requires Maven 3.9+. Install it manually:

```bash
cd /tmp
wget https://archive.apache.org/dist/maven/maven-3/3.9.11/binaries/apache-maven-3.9.11-bin.tar.gz
sudo tar -xzf apache-maven-3.9.11-bin.tar.gz -C /opt
sudo ln -sf /opt/apache-maven-3.9.11 /opt/maven
```

Then add `/opt/maven/bin` to your `PATH` (for example in `/etc/environment` or `~/.bashrc`):

```bash
export PATH=/opt/maven/bin:$PATH
```

### macOS

Install OpenJDK 17 (or newer) and Maven via Homebrew:

```bash
brew install openjdk@17 maven
```

Symlink the JDK so the macOS Java wrappers can locate it:

```bash
sudo ln -sfn $(brew --prefix)/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk
```

Set `JAVA_HOME` in your shell configuration:

```bash
echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 17)' >> ~/.zshrc
source ~/.zshrc
```

Homebrew currently ships Maven 3.9.x, which satisfies the requirement.

### Windows

Install Temurin 17 (or newer) and Maven via winget, then restart your terminal:

```powershell
winget install --id EclipseAdoptium.Temurin.17.JDK --exact
winget install Apache.Maven
```

If the installer does not set `JAVA_HOME` automatically, point the current PowerShell session at the installed JDK:

```powershell
$jdk = Get-ChildItem "C:\Program Files\Eclipse Adoptium" -Directory |
  Where-Object Name -like "jdk-17*" |
  Sort-Object Name -Descending |
  Select-Object -First 1
$env:JAVA_HOME = $jdk.FullName
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
java -version
```

### Verify the environment

Run the following command on any operating system:

```bash
mvn -v
```

The output must report **Maven 3.9+** and **Java 17 or newer**. The project also ships a Maven wrapper (`mvnw.cmd`), but only for Windows; on Linux/macOS use a system Maven install or add the wrapper manually.

On the Linux build server we use:

```bash
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
/opt/maven/bin/mvn -v
```

## Project configuration

The [pom.xml](pom.xml) enforces Java 17, Spring Boot 3.5.5, and Apache Camel 4.18.4:

```xml
<properties>
    <java.version>17</java.version>
    <camel.version>4.18.4</camel.version>
</properties>

<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.5.5</version>
    <relativePath/>
</parent>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.apache.camel.springboot</groupId>
            <artifactId>camel-spring-boot-bom</artifactId>
            <version>${camel.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

Version requirements:

| Tool / Framework | Required Version         | Configuration Source                     | Notes                                                                 |
| ---------------- | ------------------------ | ---------------------------------------- | --------------------------------------------------------------------- |
| Java             | 17+ (build target is 17) | `pom.xml` → `java.version`, `Dockerfile` | Java 21 is verified on the Jenkins build server                       |
| Maven            | 3.9+                     | `.mvn/wrapper/maven-wrapper.properties`  | Ubuntu package `maven` is 3.8.x and will fail; use 3.9.11 from Apache |
| Spring Boot      | 3.5.5                    | `pom.xml` parent                         |                                                                       |
| Apache Camel     | 4.18.4                   | `pom.xml` → `camel.version`              |                                                                       |

## Start the harness

1. Start the supporting services:

```bash
cd apis/apache-camel
docker compose up -d
```

This starts ActiveMQ Artemis on `61616` / console on `8161` (user `camel` / password `camel`) and WireMock on `8081`. The first time the `mock-http` service starts, it mounts [docker/wiremock](docker/wiremock); add your own stubs under `docker/wiremock/mappings/` as needed.

2. Build and run the harness:

```bash
mvn spring-boot:run          # Linux / macOS (use /opt/maven/bin/mvn on Ubuntu if needed)
.\mvnw.cmd spring-boot:run   # Windows PowerShell
```

The application listens on port `4005` with servlet context path `/api` (see [src/main/resources/application.yml](src/main/resources/application.yml)). The main dispatch endpoint is:

```
POST http://localhost:4005/api/connectors/{connector}
```

The `{connector}` path segment must match the URI scheme in `targetUri` (e.g. `sql`, `http`, `jms`).

## REST API

| Endpoint                             | Method | Description                                                   |
| ------------------------------------ | ------ | ------------------------------------------------------------- |
| `/api/connectors/{connector}`        | `POST` | Dispatch a request to the target Camel component              |
| `/api/connectors/{connector}/schema` | `GET`  | JSON Schema for a single connector family                     |
| `/api/connectors/schemas`            | `GET`  | JSON object mapping every connector family to its JSON Schema |

The full schema endpoint and the canonical request envelope are documented in [connectors.md](connectors.md). The sections below use the legacy envelope, which is still accepted.

## Request format

The legacy JSON request supports these fields:

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

Credentials may also be embedded in the connection string URL userinfo (`postgresql://user:pass@host:port/db`). Percent-encoded characters in the userinfo (e.g. `%40` for `@`, `%25` for `%`) are decoded automatically, and separately supplied `username`/`password` take precedence over the URL values.

Put endpoint values such as host, port, database, queue, path, and query parameters in `targetUri`. Put runtime protocol values such as HTTP method, authorization, content type, or component headers in `headers`. For SQL, supply the database URL, username, and password through the `db` block; do not place credentials in the request body or URI.

For HTTP `GET` and `DELETE`, set `CamelHttpMethod` and put URL query parameters directly in the URI:

```powershell
curl.exe -X POST http://localhost:4005/api/connectors/http `
  -H "Content-Type: application/json" `
  -d '{"targetUri":"http://localhost:8081/echo?item=42&bridgeEndpoint=true","headers":{"CamelHttpMethod":"GET"},"body":null}'

curl.exe -X POST http://localhost:4005/api/connectors/http `
  -H "Content-Type: application/json" `
  -d '{"targetUri":"http://localhost:8081/echo?item=42&bridgeEndpoint=true","headers":{"CamelHttpMethod":"DELETE"},"body":null}'
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
curl.exe -X POST http://localhost:4005/api/connectors/sql `
  -H "Content-Type: application/json" `
  -d '{"targetUri":"sql:insert into connector_events(message) values (:#message)","headers":{"message":"hello from curl"},"body":null,"db":{"url":"jdbc:postgresql://localhost:5432/your_database","username":"your_user","password":"your_password"}}'
```

Expected response includes `"ok":true`. Verify the inserted row with your database client.

### HTTP / WireMock

```powershell
curl.exe -X POST http://localhost:4005/api/connectors/http `
  -H "Content-Type: application/json" `
  -d '{"targetUri":"http://localhost:8081/echo?bridgeEndpoint=true","headers":{"Content-Type":"application/json"},"body":{"message":"hello"}}'
```

Expected response body contains `received: true` and `message: hello`. WireMock is the local downstream service, not the harness itself.

### JMS / Artemis

```powershell
curl.exe -X POST http://localhost:4005/api/connectors/jms `
  -H "Content-Type: application/json" `
  -d '{"targetUri":"jms:queue:connector-tests","body":"hello from curl"}'
```

Expected response includes `"ok":true`. Verify the message in the Artemis console at `http://localhost:8161` or consume it with a JMS client.

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

curl.exe -X POST http://localhost:4005/api/connectors/mail `
  -H "Content-Type: application/json" `
  -d $request
```

To load the body from a file, save the HTML as `mail-body.html`, then read it into the request:

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

curl.exe -X POST http://localhost:4005/api/connectors/mail `
  -H "Content-Type: application/json" `
  -d $request
```

For Gmail, use an App Password, not the normal account password. An object without `content`, such as `"body":{"message":"hello"}`, is still treated as JSON text. Do not send the HTML file itself as the JSON request.

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

## Connector code layout

Every connector follows the same **Connector → Configurer** layout across implementation and tests:

```
src/main/java/camel/harness/
├── core/                              # shared framework (dispatch, metadata, schema, auth model)
└── connectors/
    └── <connector>/
        └── <Connector>Configurer.java  # normalizes configuration and resolves the target URI
src/test/java/camel/harness/
└── connectors/
    └── <connector>/
        └── <Connector>ConfigurerTest.java
```

- Framework classes (routing, request model, metadata registry, schema, auth types, generic configurer) live in `core`.
- Each Camel component keeps its configurer inside `connectors/<name>`.
- Tests mirror the same hierarchy so adding a connector means adding its configurer and test together.

## Architecture and limitations

- `ConnectorApiRoute` owns one REST DSL route and normalizes the JSON request before dynamic dispatch.
- `BackendConfiguration` provides the local Artemis connection factory; `DynamicDatabaseRegistry` creates pooled datasources from each request's `db` block.
- `docker-compose.yml` provides ActiveMQ Artemis and WireMock. Add a narrowly scoped service when a new connector needs one.
- The endpoint intentionally permits dynamic component URIs. Run it only on a trusted local network; do not expose it as an unprotected production API.
- Generic dispatch cannot solve cloud authentication, OAuth flows, certificates, vendor-specific provisioning, or connectors with multi-step setup. Those need case-by-case test fixtures and credentials.
- The response is a diagnostic envelope, not a component-specific assertion. A successful HTTP call can still mean the downstream system accepted data incorrectly, so always check the backend effect.

## Deployment

The harness is wired into the monorepo Jenkins pipeline:

- Automatic builds trigger when files under `apis/apache-camel/` change.
- Manual builds can include `apache_camel_api` in the `REPOS_TO_BUILD` parameter.
- The pipeline builds the Spring Boot JAR with `/opt/maven/bin/mvn clean package -DskipTests`, transfers it to the target servers, and restarts the `apachecamel_apis.service` systemd unit.
- Nginx exposes the service at `https://<host>/apache-camel/api/`, proxying to the internal `camel-apis:4005` upstream.

The [Dockerfile](Dockerfile) is kept for local/containerized use, but production deployment currently follows the same JAR + systemd pattern used by the other backend services.

## API tests

A Bruno collection for the connector harness is in progress and will be added under `tests/bruno/`.

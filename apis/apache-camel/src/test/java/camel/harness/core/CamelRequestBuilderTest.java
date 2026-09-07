package camel.harness.core;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Tests the structured {@link ConnectorExecuteRequest} → flat
 * {@link ConnectorRequest} conversion performed by {@link CamelRequestBuilder}.
 * This is the contract the .NET Cloud Connector service sends to
 * {@code POST /api/connectors/execute}.
 */
class CamelRequestBuilderTest {

    private final CamelRequestBuilder builder = new CamelRequestBuilder();

    @Test
    void mapsParametersQueryAndPropertiesIntoConfiguration() {
        ConnectorExecuteRequest execute = new ConnectorExecuteRequest(
                "github", "branch.list", null,
                Map.of("owner", "acme", "repo", "widgets"),
                Map.of("per_page", 20, "page", 1),
                null, null,
                Map.of("connectionTimeout", 5000));

        ConnectorRequest request = builder.build(execute);

        assertThat(request.connectorName("")).isEqualTo("github");
        assertThat(request.operationName()).isEqualTo("branch.list");
        assertThat(request.configurationOrEmpty())
                .containsEntry("owner", "acme")
                .containsEntry("repo", "widgets")
                .containsEntry("per_page", 20)
                .containsEntry("page", 1)
                .containsEntry("connectionTimeout", 5000);
        assertThat(request.auth()).isNull();
    }

    @Test
    void mapsBodyIntoPayload() {
        ConnectorExecuteRequest execute = new ConnectorExecuteRequest(
                "github", "issue.create", null,
                Map.of("owner", "acme", "repo", "widgets"),
                null, null,
                Map.of("title", "Bug fix", "body", "Details"),
                null);

        ConnectorRequest request = builder.build(execute);

        assertThat(request.payload()).isInstanceOf(Map.class);
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) request.payload();
        assertThat(body)
                .containsEntry("title", "Bug fix")
                .containsEntry("body", "Details");
    }

    @Test
    void mapsHeadersIntoHeaders() {
        ConnectorExecuteRequest execute = new ConnectorExecuteRequest(
                "http", "GET", null,
                Map.of("host", "example.com"),
                null,
                Map.of("Accept", "application/json"),
                null, null);

        ConnectorRequest request = builder.build(execute);

        assertThat(request.headersOrEmpty())
                .containsEntry("Accept", "application/json");
    }

    @Test
    void mapsAccessTokenAuthentication() {
        ConnectorExecuteRequest execute = new ConnectorExecuteRequest(
                "github", "branch.list",
                new ConnectorAuthentication("accessToken",
                        new ConnectorCredential("GitHubCredential",
                                Map.of("token", "ghp_secret"))),
                Map.of("owner", "acme", "repo", "widgets"),
                null, null, null, null);

        ConnectorRequest request = builder.build(execute);

        AuthConfiguration auth = request.auth();
        assertThat(auth).isNotNull();
        assertThat(auth.authType()).isEqualTo(AuthType.ACCESS_TOKEN);
        assertThat(auth.token()).isEqualTo("ghp_secret");
    }

    @Test
    void mapsBasicAuthentication() {
        ConnectorExecuteRequest execute = new ConnectorExecuteRequest(
                "http", "GET",
                new ConnectorAuthentication("basic",
                        new ConnectorCredential("HttpCredential",
                                Map.of("username", "user", "password", "pass"))),
                Map.of("host", "example.com"),
                null, null, null, null);

        ConnectorRequest request = builder.build(execute);

        AuthConfiguration auth = request.auth();
        assertThat(auth).isNotNull();
        assertThat(auth.authType()).isEqualTo(AuthType.BASIC);
        assertThat(auth.username()).isEqualTo("user");
        assertThat(auth.password()).isEqualTo("pass");
    }

    @Test
    void mapsDatabaseAuthenticationProperties() {
        ConnectorExecuteRequest execute = new ConnectorExecuteRequest(
                "sql", "query",
                new ConnectorAuthentication("database",
                        new ConnectorCredential("DbCredential",
                                Map.of("properties", Map.of(
                                        "url", "postgresql://localhost:5432/db",
                                        "username", "postgres",
                                        "password", "secret")))),
                Map.of("query", "select 1"),
                null, null, null, null);

        ConnectorRequest request = builder.build(execute);

        AuthConfiguration auth = request.auth();
        assertThat(auth).isNotNull();
        assertThat(auth.authType()).isEqualTo(AuthType.DATABASE);
        assertThat(auth.properties())
                .containsEntry("url", "postgresql://localhost:5432/db")
                .containsEntry("username", "postgres")
                .containsEntry("password", "secret");
    }

    @Test
    void noneAuthenticationProducesNullAuth() {
        ConnectorExecuteRequest execute = new ConnectorExecuteRequest(
                "file", "write",
                new ConnectorAuthentication("none", null),
                Map.of("directoryName", "/tmp"),
                null, null, null, null);

        ConnectorRequest request = builder.build(execute);

        assertThat(request.auth()).isNull();
        assertThat(request.configurationOrEmpty()).containsEntry("directoryName", "/tmp");
    }
}

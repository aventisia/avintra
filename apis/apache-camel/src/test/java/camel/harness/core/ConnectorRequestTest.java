package camel.harness.core;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Tests the new flat-contract reconstruction logic in {@link ConnectorRequest}.
 * These tests cover the migration path where the .NET proxy sends a flattened
 * envelope with {@code requestFields} metadata instead of the legacy nested
 * {@code configuration}/{@code auth}/{@code payload} blocks.
 */
class ConnectorRequestTest {

    @Test
    @SuppressWarnings("unchecked")
    void flatContractSplitsPayloadIntoConfigAndBody() {
        Map<String, Object> flatPayload = Map.of(
                "owner", "acme",
                "repo", "widgets",
                "title", "Bug fix",
                "body", "Details");

        List<ConnectorRequestField> requestFields = List.of(
                new ConnectorRequestField("owner", "config", true),
                new ConnectorRequestField("repo", "config", true),
                new ConnectorRequestField("title", "body", true),
                new ConnectorRequestField("body", "body", false));

        ConnectorRequest request = new ConnectorRequest(
                null, null, "github", "issue.create", null, null, null,
                flatPayload, null, null, "accessToken", "ghp_token", null, null,
                null, null, null, null, requestFields);

        assertThat(request.configurationOrEmpty())
                .containsOnlyKeys("owner", "repo")
                .containsEntry("owner", "acme")
                .containsEntry("repo", "widgets");

        Object payload = request.payload();
        assertThat(payload).isInstanceOf(Map.class);
        Map<String, Object> body = (Map<String, Object>) payload;
        assertThat(body)
                .containsOnlyKeys("title", "body")
                .containsEntry("title", "Bug fix")
                .containsEntry("body", "Details");

        assertThat(request.auth()).isNotNull();
        assertThat(request.auth().authType()).isEqualTo(AuthType.ACCESS_TOKEN);
        assertThat(request.auth().token()).isEqualTo("ghp_token");
    }

    @Test
    void singleBodyFieldIsUnwrapped() {
        Map<String, Object> flatPayload = Map.of(
                "queueName", "orders",
                "message", "hello");

        List<ConnectorRequestField> requestFields = List.of(
                new ConnectorRequestField("queueName", "config", true),
                new ConnectorRequestField("message", "body", true));

        ConnectorRequest request = new ConnectorRequest(
                null, null, "jms", "send", null, null, null,
                flatPayload, null, null, "basic", null, "user", "pass",
                null, null, null, null, requestFields);

        assertThat(request.payload()).isEqualTo("hello");
        assertThat(request.configurationOrEmpty())
                .containsOnlyKeys("queueName")
                .containsEntry("queueName", "orders");
    }

    @Test
    void legacyConfigurationAndPayloadTakePrecedence() {
        Map<String, Object> configuration = Map.of("host", "example.com");
        Map<String, Object> payload = Map.of("q", "query");

        ConnectorRequest request = ConnectorRequest.legacy(
                null, null, "http", "GET", configuration,
                new AuthConfiguration("none", null, null, null, null, null,
                        null, null, null, null, null, null, null, null, null,
                        null, null, null, null),
                null, payload, null, null);

        assertThat(request.configurationOrEmpty()).containsOnlyKeys("host");

        Object body = request.payload();
        assertThat(body).isInstanceOf(Map.class);
        @SuppressWarnings("unchecked")
        Map<String, Object> bodyMap = (Map<String, Object>) body;
        assertThat(bodyMap).containsOnlyKeys("q");
    }

    @Test
    void flatContractWithoutRequestFieldsDefaultsAllToConfig() {
        Map<String, Object> flatPayload = Map.of("owner", "acme", "repo", "widgets");

        ConnectorRequest request = new ConnectorRequest(
                null, null, "github", "repository.list", null, null, null,
                flatPayload, null, null, "accessToken", "token", null, null,
                null, null, null, null, null);

        assertThat(request.configurationOrEmpty())
                .containsOnlyKeys("owner", "repo")
                .containsEntry("owner", "acme")
                .containsEntry("repo", "widgets");

        Object body = request.payload();
        assertThat(body).isInstanceOf(Map.class);
        @SuppressWarnings("unchecked")
        Map<String, Object> bodyMap = (Map<String, Object>) body;
        assertThat(bodyMap).containsOnlyKeys("owner", "repo");
    }

    @Test
    void noAuthTypeReturnsNullAuth() {
        Map<String, Object> filePayload = Map.of("directoryName", "/tmp");
        ConnectorRequest request = new ConnectorRequest(
                null, null, "file", "write", null, null, null,
                filePayload, null, null, null, null, null,
                null, null, null, null, null, null);

        assertThat(request.auth()).isNull();
    }
}

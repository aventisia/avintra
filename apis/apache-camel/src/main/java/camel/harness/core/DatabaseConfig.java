package camel.harness.core;

public record DatabaseConfig(
        String url,
        String username,
        String password) {
}

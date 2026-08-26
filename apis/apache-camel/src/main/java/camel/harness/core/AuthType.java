package camel.harness.core;

public enum AuthType {
    NONE,
    BASIC,
    BEARER,
    ACCESS_TOKEN,
    API_KEY,
    CLIENT_CREDENTIALS,
    OAUTH2,
    AUTHORIZATION_CODE,
    REFRESH_TOKEN,
    DEVICE_CODE,
    ON_BEHALF_OF,
    AWS,
    AZURE,
    GCP,
    DATABASE;

    public static AuthType fromString(String value) {
        if (value == null || value.isBlank()) {
            return NONE;
        }
        return switch (value.toLowerCase()) {
            case "basic" -> BASIC;
            case "bearer" -> BEARER;
            case "accesstoken", "access_token", "pat" -> ACCESS_TOKEN;
            case "apikey", "api_key" -> API_KEY;
            case "clientcredentials", "client_credentials" -> CLIENT_CREDENTIALS;
            case "oauth2", "oauth" -> OAUTH2;
            case "authorizationcode", "authorization_code", "authcode" -> AUTHORIZATION_CODE;
            case "refreshtoken", "refresh_token" -> REFRESH_TOKEN;
            case "devicecode", "device_code" -> DEVICE_CODE;
            case "onbehalfof", "on_behalf_of", "obo" -> ON_BEHALF_OF;
            case "aws", "awsiam", "accesskey" -> AWS;
            case "azure", "azuread" -> AZURE;
            case "gcp", "google", "serviceaccount" -> GCP;
            case "database", "db" -> DATABASE;
            default -> NONE;
        };
    }
}

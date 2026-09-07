package camel.harness.connectors.mail.smtp;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;

import org.apache.camel.Exchange;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.support.DefaultExchange;
import org.junit.jupiter.api.Test;

import camel.harness.connectors.mail.MailConfigurer;
import camel.harness.core.AuthConfiguration;
import camel.harness.core.ConnectorRequest;

/**
 * Focused tests for the Mail {@code smtp} service (the {@code send} operation):
 * scheme/host/port building, STARTTLS on 587, SMTPS on 465, and header mapping.
 */
class MailSmtpSendTest {

    private final MailConfigurer configurer = new MailConfigurer();

    private Exchange resolve(Map<String, Object> config, AuthConfiguration auth) {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        ConnectorRequest request = ConnectorRequest.legacy(null, null, "mail", "send", config,
            auth, null, null, null, null);
        String uri = configurer.resolveEndpoint(exchange, request, null);
        exchange.setProperty("targetUri", uri);
        return exchange;
    }

    private static AuthConfiguration basic() {
        return new AuthConfiguration("basic", "test", "test", null, null, null,
            null, null, null, null, null, null, null, null, null, null, null, null, null);
    }

    @Test
    void buildsSmtpUriWithTo() {
        Exchange exchange = resolve(Map.of("scheme", "smtp", "host", "smtp.example.com", "port", "587",
            "to", "receiver@example.com", "from", "sender@example.com"), basic());
        String uri = (String) exchange.getProperty("targetUri");
        assertTrue(uri.startsWith("smtp://smtp.example.com:587"));
        assertTrue(uri.contains("to=receiver%40example.com"));
        assertTrue(uri.contains("from=sender%40example.com"));
        assertTrue(uri.contains("starttls=true"));
    }

    @Test
    void port465UsesSmtpsScheme() {
        Exchange exchange = resolve(Map.of("scheme", "smtp", "host", "smtp.example.com", "port", "465",
            "to", "receiver@example.com"), basic());
        String uri = (String) exchange.getProperty("targetUri");
        assertTrue(uri.startsWith("smtps://smtp.example.com:465"));
    }

    @Test
    void subjectMapsToHeader() {
        Exchange exchange = resolve(Map.of("scheme", "smtp", "host", "smtp.example.com", "port", "587",
            "to", "receiver@example.com", "subject", "Test email"), basic());
        assertEquals("Test email", exchange.getMessage().getHeader("CamelMailSubject", String.class));
    }

    @Test
    void contentTypeNormalizedToTextPlain() {
        Exchange exchange = resolve(Map.of("scheme", "smtp", "host", "smtp.example.com", "port", "587",
            "to", "receiver@example.com", "contentType", "text"), basic());
        assertEquals("text/plain", exchange.getMessage().getHeader("CamelMailContentType", String.class));
    }
}

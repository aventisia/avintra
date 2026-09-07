package camel.harness.connectors.mail.imap;

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
 * Focused tests for the Mail {@code imap} service (read/search/delete):
 * consumer-style operations build an {@code imap://host:port} URI.
 */
class MailImapReadTest {

    private final MailConfigurer configurer = new MailConfigurer();

    private Exchange resolve(String operation) {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        AuthConfiguration auth = new AuthConfiguration("basic", "test", "test", null, null, null,
            null, null, null, null, null, null, null, null, null, null, null, null, null);
        ConnectorRequest request = ConnectorRequest.legacy(null, null, "mail", operation,
            Map.of("scheme", "imap", "host", "imap.example.com", "port", "993"), auth,
            null, null, null, null);
        String uri = configurer.resolveEndpoint(exchange, request, null);
        exchange.setProperty("targetUri", uri);
        return exchange;
    }

    @Test
    void readBuildsImapUri() {
        String uri = (String) resolve("read").getProperty("targetUri");
        assertTrue(uri.startsWith("imap://imap.example.com:993"));
        assertTrue(uri.contains("username=test"));
    }

    @Test
    void searchBuildsImapUri() {
        String uri = (String) resolve("search").getProperty("targetUri");
        assertTrue(uri.startsWith("imap://imap.example.com:993"));
    }

    @Test
    void deleteBuildsImapUri() {
        String uri = (String) resolve("delete").getProperty("targetUri");
        assertTrue(uri.startsWith("imap://imap.example.com:993"));
    }
}

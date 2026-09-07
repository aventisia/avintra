package camel.harness.connectors.ftp.append;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;

import org.apache.camel.Exchange;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.support.DefaultExchange;
import org.junit.jupiter.api.Test;

import camel.harness.connectors.ftp.FtpConfigurer;
import camel.harness.core.AuthConfiguration;
import camel.harness.core.ConnectorRequest;

/**
 * Focused tests for the FTP {@code append} action: {@code appendPosition=end}
 * yields {@code fileExist=Append}; {@code start} yields read-modify-write
 * options instead.
 */
class FtpAppendTest {

    private final FtpConfigurer configurer = new FtpConfigurer();

    private String resolve(String position) {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        Map<String, Object> config = new java.util.LinkedHashMap<>();
        config.put("scheme", "ftp");
        config.put("host", "localhost");
        config.put("port", "21");
        config.put("directoryName", "upload");
        config.put("fileName", "data.txt");
        config.put("appendPosition", position);
        AuthConfiguration auth = new AuthConfiguration("basic", "test", "test", null, null, null,
            null, null, null, null, null, null, null, null, null, null, null, null, null);
        ConnectorRequest request = ConnectorRequest.legacy(null, null, "ftp", "append", config,
            auth, null, null, null, null);
        return configurer.resolveEndpoint(exchange(), request, null);
    }

    private Exchange exchange() {
        return new DefaultExchange(new DefaultCamelContext());
    }

    @Test
    void endPositionUsesFileExistAppend() {
        assertTrue(resolve("end").contains("fileExist=Append"));
    }

    @Test
    void startPositionUsesReadModifyWriteOptions() {
        String uri = resolve("start");
        assertTrue(uri.contains("idempotent=false"));
        assertTrue(uri.contains("maxMessagesPerPoll=1"));
    }
}

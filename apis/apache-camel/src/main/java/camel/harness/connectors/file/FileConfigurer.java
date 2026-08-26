package camel.harness.connectors.file;

import camel.harness.core.*;
import java.util.Map;

import org.apache.camel.Exchange;
import org.springframework.stereotype.Component;

@Component
public class FileConfigurer implements ConnectorConfigurer {

    @Override
    public String connectorName() {
        return "file";
    }

    @Override
    public String resolveEndpoint(Exchange exchange, ConnectorRequest request, ConnectorMetadata metadata) {
        Map<String, Object> config = request.configurationOrEmpty();
        String directory = (String) config.get("directoryName");
        if (directory == null || directory.isBlank()) {
            throw new IllegalArgumentException("File directoryName is required in configuration.directoryName");
        }

        StringBuilder uri = new StringBuilder("file:").append(directory);
        String fileName = (String) config.get("fileName");
        if (fileName != null && !fileName.isBlank()) {
            uri.append("?fileName=").append(fileName);
        }
        return uri.toString();
    }
}

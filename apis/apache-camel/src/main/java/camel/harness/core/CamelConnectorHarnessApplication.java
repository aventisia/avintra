package camel.harness.core;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "camel.harness")
public class CamelConnectorHarnessApplication {
    public static void main(String[] args) {
        SpringApplication.run(CamelConnectorHarnessApplication.class, args);
    }
}

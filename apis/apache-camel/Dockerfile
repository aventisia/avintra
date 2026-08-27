# Build stage: Maven + JDK 17
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY pom.xml .
# Resolve dependencies first for better layer caching
RUN mvn -B -ntp dependency:go-offline || true
COPY src ./src
RUN mvn -B -ntp clean package -DskipTests

# Runtime stage: JRE 17
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /workspace/target/camel-connector-harness-0.1.0-SNAPSHOT.jar /app/app.jar

# The harness is an internal-only service: never publish 4005 to the public
# internet. It is reached only by the Workspace API over the internal Docker
# network.
EXPOSE 4005

ENTRYPOINT ["java", "-jar", "/app/app.jar"]

# ==============================================================================
# DRISHTI Backend - Multi-Stage Production Dockerfile
# ==============================================================================

# --- Stage 1: Build the Spring Boot application ---
FROM eclipse-temurin:17-jdk-jammy AS builder
WORKDIR /workspace/app

# Copy Maven wrapper and POM first for efficient layer caching
COPY pom.xml mvnw ./
COPY .mvn .mvn

# Download dependencies in offline-capable cache layer
RUN ./mvnw dependency:go-offline -B || true

# Copy source code and compile production JAR
COPY . .

RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests -B

# Extract layered Spring Boot jar for optimized container caching
RUN java -Djarmode=layertools -jar target/*.jar extract

# --- Stage 2: Minimal, Hardened Runtime ---
FROM eclipse-temurin:17-jre-jammy
WORKDIR /application

# Create dedicated non-root application user and group
RUN groupadd -r drishti && useradd -r -g drishti -d /application -s /sbin/nologin drishti

# Install curl for container health check
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Copy extracted layers from builder
COPY --from=builder --chown=drishti:drishti /workspace/app/dependencies/ ./
COPY --from=builder --chown=drishti:drishti /workspace/app/spring-boot-loader/ ./
COPY --from=builder --chown=drishti:drishti /workspace/app/snapshot-dependencies/ ./
COPY --from=builder --chown=drishti:drishti /workspace/app/application/ ./

# Set permissions and switch to unprivileged user
USER drishti:drishti

# Default JVM container ergonomics
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -Djava.security.egd=file:/dev/./urandom"
ENV SERVER_PORT=8080

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]

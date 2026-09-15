FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src src
RUN mvn -B package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S archai && adduser -S archai -G archai
COPY --from=builder /app/target/archai-backend-*.jar app.jar
USER archai
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

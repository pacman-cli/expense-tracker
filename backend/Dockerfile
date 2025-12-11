# Stage 1: build
FROM maven:3.9.1-eclipse-temurin-17 AS builder
WORKDIR /app

# Copy the pom.xml file separately to leverage Docker layer caching
COPY pom.xml .
# Download all required dependencies into the local repository
# This layer will be cached unless pom.xml changes
RUN mvn dependency:go-offline -B

# Copy the source code
COPY src ./src

# Package the application
RUN mvn -B -DskipTests package

# Stage 2: runtime
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
# ENTRYPOINT ["java","-jar","/app/app.jar"]
ENTRYPOINT ["java", "-Xms512m", "-Xmx4096m", "-jar", "/app/app.jar"]
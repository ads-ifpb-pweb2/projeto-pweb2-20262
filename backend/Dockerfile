FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /build
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 mvn -q -B dependency:go-offline
COPY src src
RUN --mount=type=cache,target=/root/.m2 mvn -q -B package -DskipTests

FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /build/target/marketplace.jar app.jar
# O compose monta ./backend/db por cima desta cópia; ela serve para rodar a imagem sozinha.
COPY db db
RUN mkdir -p /app/data
EXPOSE 8080
# O sqlite-jdbc carrega uma biblioteca nativa
ENTRYPOINT ["java", "--enable-native-access=ALL-UNNAMED", "-jar", "app.jar"]

package br.edu.ifpb.marketplace;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.wait.strategy.Wait;

/**
 * Sobe a API numa porta aleatória, com um armazenamento RustFS real (Testcontainers) e um banco SQLite novo
 * por classe de teste: cada classe começa só com o schema.sql e o carga.sql de {@code backend/db}.
 * Requer o Docker rodando.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
public abstract class IntegracaoBase {

    protected static final String SENHA_CARGA = "senha123";
    protected static final String ANA = "ana.silva@academico.ifpb.edu.br";
    protected static final String BRUNO = "bruno.costa@academico.ifpb.edu.br";
    protected static final String CARLA = "carla.souza@academico.ifpb.edu.br";

    private static final String CHAVE = "marketplace";
    private static final String SEGREDO = "marketplace123";

    // Um container para todas as classes; o Testcontainers o remove ao fim da execução
    private static final GenericContainer<?> RUSTFS = new GenericContainer<>("rustfs/rustfs:1.0.3")
            .withExposedPorts(9000)
            .withEnv("RUSTFS_ACCESS_KEY", CHAVE)
            .withEnv("RUSTFS_SECRET_KEY", SEGREDO)
            .waitingFor(Wait.forHttp("/health").forPort(9000));

    static {
        RUSTFS.start();
    }

    private static final HttpClient HTTP = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

    @Value("${local.server.port}")
    private int porta;

    protected Api api;

    @DynamicPropertySource
    static void propriedades(DynamicPropertyRegistry registro) {
        String s3 = "http://" + RUSTFS.getHost() + ":" + RUSTFS.getMappedPort(9000);
        registro.add("spring.datasource.url", () -> "jdbc:sqlite:" + bancoTemporario());
        registro.add("app.s3.endpoint", () -> s3);
        registro.add("app.s3.url-publica", () -> s3);
        registro.add("app.s3.access-key", () -> CHAVE);
        registro.add("app.s3.secret-key", () -> SEGREDO);
        registro.add("app.jwt.segredo", () -> "segredo-dos-testes-com-pelo-menos-32-caracteres");
    }

    private static Path bancoTemporario() {
        try {
            Path dir = Files.createTempDirectory("marketplace-teste");
            dir.toFile().deleteOnExit();
            return dir.resolve("marketplace.db");
        } catch (IOException e) {
            throw new IllegalStateException(e);
        }
    }

    @BeforeEach
    void criarApi() {
        api = new Api(porta);
    }

    /** Faz login e devolve o token. */
    protected String login(String email) {
        return api.postJson("/auth/login", null, """
                {"email": "%s", "senha": "%s"}""".formatted(email, SENHA_CARGA)).json("$.token");
    }

    /** Status e Content-Type de uma URL assinada, acessada como o navegador faria. */
    protected static String acessar(String url) throws IOException, InterruptedException {
        HttpResponse<Void> resposta = HTTP.send(HttpRequest.newBuilder(URI.create(url)).build(),
                HttpResponse.BodyHandlers.discarding());
        return resposta.statusCode() + " " + resposta.headers().firstValue("Content-Type").orElse("");
    }

    /** Uma das fotos de exemplo de {@code backend/db/fotos}. */
    protected static byte[] foto(String nome) {
        try {
            return Files.readAllBytes(Path.of("db/fotos", nome));
        } catch (IOException e) {
            throw new IllegalStateException(e);
        }
    }
}

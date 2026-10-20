package br.edu.ifpb.marketplace;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;

class DocumentacaoECorsTest extends IntegracaoBase {

    @Test
    void raizRedirecionaParaOSwagger() {
        Resposta r = api.get("/", null);

        assertThat(r.status()).isEqualTo(302);
        assertThat(r.headers().getLocation()).asString().endsWith("/swagger-ui.html");
    }

    @Test
    void swaggerEOpenApiSaoPublicos() {
        assertThat(api.get("/swagger-ui/index.html", null).status()).isEqualTo(200);

        Resposta docs = api.get("/v3/api-docs", null);
        assertThat(docs.status()).isEqualTo(200);
        assertThat(docs.<Map<String, Object>>json("$.paths['/anuncios'].post.requestBody.content"))
                .containsOnlyKeys("multipart/form-data");
    }

    @Test
    void liberaOFrontendEmLocalhost() {
        Resposta r = api.enviar(HttpMethod.OPTIONS, "/anuncios", null, req -> req
                .header(HttpHeaders.ORIGIN, "http://localhost:5173")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "authorization"));

        assertThat(r.status()).isEqualTo(200);
        assertThat(r.headers().getAccessControlAllowOrigin()).isEqualTo("http://localhost:5173");
    }

    @Test
    void naoLiberaOutrasOrigens() {
        Resposta r = api.enviar(HttpMethod.OPTIONS, "/anuncios", null, req -> req
                .header(HttpHeaders.ORIGIN, "http://exemplo.com")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST"));

        assertThat(r.status()).isEqualTo(403);
    }

    @Test
    void caminhoInexistenteDevolve404EmJson() {
        Resposta r = api.get("/nao-existe", login(ESTUDANTE));

        assertThat(r.status()).isEqualTo(404);
        assertThat(r.<String>json("$.mensagem")).isEqualTo("Caminho não encontrado.");
    }
}

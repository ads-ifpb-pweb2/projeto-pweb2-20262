package br.edu.ifpb.marketplace;

import java.net.http.HttpClient;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

/** Cliente HTTP dos testes: nunca lança exceção por status de erro, para os testes conferirem o status. */
public class Api {

    private final RestClient http;

    public Api(int porta) {
        // Sem seguir redirects, para os testes verem o 302
        var cliente = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NEVER).build();
        this.http = RestClient.builder()
                .baseUrl("http://localhost:" + porta)
                .requestFactory(new JdkClientHttpRequestFactory(cliente))
                .build();
    }

    public Resposta get(String uri, String token) {
        return enviar(HttpMethod.GET, uri, token, r -> {
        });
    }

    public Resposta postJson(String uri, String token, String json) {
        return json(HttpMethod.POST, uri, token, json);
    }

    public Resposta putJson(String uri, String token, String json) {
        return json(HttpMethod.PUT, uri, token, json);
    }

    public Resposta patchJson(String uri, String token, String json) {
        return json(HttpMethod.PATCH, uri, token, json);
    }

    public Resposta multipart(HttpMethod metodo, String uri, String token, Formulario formulario) {
        var corpo = formulario.construir();
        return enviar(metodo, uri, token, r -> r.contentType(MediaType.MULTIPART_FORM_DATA).body(corpo));
    }

    public Resposta enviar(HttpMethod metodo, String uri, String token, Consumer<RestClient.RequestBodySpec> config) {
        RestClient.RequestBodySpec requisicao = http.method(metodo).uri(uri);
        if (token != null) {
            requisicao.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
        }
        config.accept(requisicao);
        return requisicao.exchange((req, res) -> new Resposta(res.getStatusCode().value(),
                new String(res.getBody().readAllBytes(), StandardCharsets.UTF_8), res.getHeaders()));
    }

    private Resposta json(HttpMethod metodo, String uri, String token, String json) {
        return enviar(metodo, uri, token, r -> r.contentType(MediaType.APPLICATION_JSON).body(json));
    }

    /** Campos e arquivos de um multipart/form-data. Repetir {@link #campo} troca o valor. */
    public static class Formulario {

        private final Map<String, List<Object>> campos = new LinkedHashMap<>();
        private final List<Arquivo> arquivos = new ArrayList<>();

        public Formulario campo(String nome, Object valor) {
            campos.put(nome, List.of(valor));
            return this;
        }

        /** Campo com vários valores, como {@code fotosMantidas}. */
        public Formulario lista(String nome, Object... valores) {
            campos.put(nome, List.of(valores));
            return this;
        }

        public Formulario arquivo(String nome, byte[] conteudo, String nomeArquivo) {
            arquivos.add(new Arquivo(nome, conteudo, nomeArquivo));
            return this;
        }

        MultiValueMap<String, HttpEntity<?>> construir() {
            var corpo = new MultipartBodyBuilder();
            campos.forEach((nome, valores) -> valores.forEach(v -> corpo.part(nome, String.valueOf(v))));
            arquivos.forEach(a -> corpo.part(a.nome(), a.conteudo()).filename(a.nomeArquivo())
                    .contentType(MediaType.APPLICATION_OCTET_STREAM));
            return corpo.build();
        }

        private record Arquivo(String nome, byte[] conteudo, String nomeArquivo) {
        }
    }
}

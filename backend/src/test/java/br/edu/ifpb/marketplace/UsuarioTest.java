package br.edu.ifpb.marketplace;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;

import br.edu.ifpb.marketplace.Api.Formulario;

class UsuarioTest extends IntegracaoBase {

    @Test
    void devolveOUsuarioLogadoComFotoAssinada() throws Exception {
        Resposta r = api.get("/usuarios/eu", login(ANA));

        assertThat(r.status()).isEqualTo(200);
        assertThat(r.<String>json("$.nome")).isEqualTo("Ana Silva");
        assertThat(r.<String>json("$.curso.nome")).isEqualTo("Análise e Desenvolvimento de Sistemas");
        assertThat(r.<String>json("$.papel")).isEqualTo("estudante");
        assertThat(acessar(r.json("$.fotoUrl"))).isEqualTo("200 image/jpeg");
    }

    @Test
    void mostraOPerfilDeOutroEstudanteSemEmail() {
        Resposta r = api.get("/usuarios/3", login(ANA));

        assertThat(r.status()).isEqualTo(200);
        assertThat(r.<String>json("$.nome")).isEqualTo("Carla Souza");
        assertThat(r.<String>json("$.curso.nome")).isEqualTo("Técnico Integrado em Informática");
        assertThat(r.corpo()).doesNotContain("email");
    }

    @Test
    void perfilInexistenteDevolve404() {
        assertThat(api.get("/usuarios/999", login(ANA)).status()).isEqualTo(404);
    }

    @Test
    void oDonoVeTodosOsSeusAnuncios() {
        Resposta r = api.get("/usuarios/1/anuncios", login(ANA));

        assertThat(r.<Integer>json("$.total")).isEqualTo(6);
        assertThat(r.<List<String>>json("$.itens[*].estado"))
                .contains("ativo", "pausado", "reservado", "vendido");
    }

    @Test
    void osDemaisVeemSoOsAnunciosAtivos() {
        Resposta r = api.get("/usuarios/1/anuncios", login(CARLA));

        assertThat(r.<List<Integer>>json("$.itens[*].id")).containsExactly(4, 2, 1);
    }

    @Test
    void editaOsPropriosDados() {
        Resposta r = api.putJson("/usuarios/eu", login(BRUNO), """
                {"nome": "Bruno C.", "cursoId": 1, "telefone": "(83) 98888-0000"}""");

        assertThat(r.status()).isEqualTo(200);
        assertThat(r.<String>json("$.nome")).isEqualTo("Bruno C.");
        assertThat(r.<Integer>json("$.curso.id")).isEqualTo(1);
        assertThat(r.<String>json("$.telefone")).isEqualTo("(83) 98888-0000");
    }

    @Test
    void editarComCursoInvalidoDevolve400() {
        Resposta r = api.putJson("/usuarios/eu", login(BRUNO), """
                {"nome": "Bruno", "cursoId": 50}""");

        assertThat(r.status()).isEqualTo(400);
        assertThat(r.<String>json("$.campos.cursoId")).isEqualTo("Curso não encontrado.");
    }

    @Test
    void enviaEDepoisTrocaAFotoDePerfil() throws Exception {
        String token = login(CARLA);

        Resposta primeira = api.multipart(HttpMethod.PUT, "/usuarios/eu/foto", token,
                new Formulario().arquivo("foto", foto("usuario-bruno.jpg"), "eu.jpg"));
        String urlPrimeira = primeira.json("$.fotoUrl");
        Resposta segunda = api.multipart(HttpMethod.PUT, "/usuarios/eu/foto", token,
                new Formulario().arquivo("foto", foto("usuario-ana.jpg"), "eu.jpg"));

        assertThat(primeira.status()).isEqualTo(200);
        assertThat(acessar(segunda.json("$.fotoUrl"))).isEqualTo("200 image/jpeg");
        assertThat(acessar(urlPrimeira)).startsWith("404");
    }

    @Test
    void fotoDePerfilQueNaoEImagemDevolve400() {
        Resposta r = api.multipart(HttpMethod.PUT, "/usuarios/eu/foto", login(CARLA),
                new Formulario().arquivo("foto", "não sou imagem".getBytes(), "foto.jpg"));

        assertThat(r.status()).isEqualTo(400);
        assertThat(r.<String>json("$.campos.foto")).isEqualTo("Envie imagens JPEG, PNG ou WebP.");
    }
}

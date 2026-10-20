package br.edu.ifpb.marketplace;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;

import br.edu.ifpb.marketplace.Api.Formulario;

class UsuarioTest extends IntegracaoBase {

    @Test
    void devolveOUsuarioLogadoComFotoAssinada() throws Exception {
        Resposta r = api.get("/usuarios/eu", login(ESTUDANTE));

        assertThat(r.status()).isEqualTo(200);
        assertThat(r.<String>json("$.nome")).isEqualTo("Estudante de Exemplo");
        assertThat(r.<String>json("$.curso.nome")).isEqualTo("Análise e Desenvolvimento de Sistemas");
        assertThat(r.<String>json("$.papel")).isEqualTo("estudante");
        assertThat(acessar(r.json("$.fotoUrl"))).isEqualTo("200 image/jpeg");
    }

    @Test
    void mostraOPerfilDeOutroEstudanteSemEmail() {
        Resposta r = api.get("/usuarios/1", outroEstudante());

        assertThat(r.status()).isEqualTo(200);
        assertThat(r.<String>json("$.nome")).isEqualTo("Estudante de Exemplo");
        assertThat(r.<String>json("$.curso.nome")).isEqualTo("Análise e Desenvolvimento de Sistemas");
        assertThat(r.corpo()).doesNotContain("email");
    }

    @Test
    void perfilInexistenteDevolve404() {
        assertThat(api.get("/usuarios/999", login(ESTUDANTE)).status()).isEqualTo(404);
    }

    @Test
    void oDonoVeTodosOsSeusAnuncios() {
        Resposta r = api.get("/usuarios/1/anuncios?tamanho=50", login(ESTUDANTE));

        assertThat(r.<Integer>json("$.total")).isEqualTo(18);
        assertThat(r.<List<String>>json("$.itens[*].estado"))
                .contains("ativo", "pausado", "reservado", "vendido", "concluido");
    }

    @Test
    void osDemaisVeemSoOsAnunciosAtivos() {
        Resposta r = api.get("/usuarios/1/anuncios?tamanho=50", outroEstudante());

        assertThat(r.<List<Integer>>json("$.itens[*].id"))
                .containsExactly(18, 17, 16, 14, 13, 11, 10, 9, 8, 7, 4, 2, 1);
    }

    @Test
    void editaOsPropriosDados() {
        Resposta r = api.putJson("/usuarios/eu", outroEstudante(), """
                {"nome": "Outro E.", "cursoId": 1, "telefone": "(83) 98888-0000"}""");

        assertThat(r.status()).isEqualTo(200);
        assertThat(r.<String>json("$.nome")).isEqualTo("Outro E.");
        assertThat(r.<Integer>json("$.curso.id")).isEqualTo(1);
        assertThat(r.<String>json("$.telefone")).isEqualTo("(83) 98888-0000");
    }

    @Test
    void editarComCursoInvalidoDevolve400() {
        Resposta r = api.putJson("/usuarios/eu", outroEstudante(), """
                {"nome": "Outro", "cursoId": 50}""");

        assertThat(r.status()).isEqualTo(400);
        assertThat(r.<String>json("$.campos.cursoId")).isEqualTo("Curso não encontrado.");
    }

    @Test
    void enviaEDepoisTrocaAFotoDePerfil() throws Exception {
        String token = outroEstudante();

        Resposta primeira = api.multipart(HttpMethod.PUT, "/usuarios/eu/foto", token,
                new Formulario().arquivo("foto", foto("usuario-estudante.jpg"), "eu.jpg"));
        String urlPrimeira = primeira.json("$.fotoUrl");
        Resposta segunda = api.multipart(HttpMethod.PUT, "/usuarios/eu/foto", token,
                new Formulario().arquivo("foto", foto("anuncio-01-1.jpg"), "eu.jpg"));

        assertThat(primeira.status()).isEqualTo(200);
        assertThat(acessar(segunda.json("$.fotoUrl"))).isEqualTo("200 image/jpeg");
        assertThat(acessar(urlPrimeira)).startsWith("404");
    }

    @Test
    void fotoDePerfilQueNaoEImagemDevolve400() {
        Resposta r = api.multipart(HttpMethod.PUT, "/usuarios/eu/foto", outroEstudante(),
                new Formulario().arquivo("foto", "não sou imagem".getBytes(), "foto.jpg"));

        assertThat(r.status()).isEqualTo(400);
        assertThat(r.<String>json("$.campos.foto")).isEqualTo("Envie imagens JPEG, PNG ou WebP.");
    }
}

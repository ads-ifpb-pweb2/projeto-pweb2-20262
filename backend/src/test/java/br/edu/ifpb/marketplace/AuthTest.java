package br.edu.ifpb.marketplace;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import br.edu.ifpb.marketplace.auth.TokenService;
import br.edu.ifpb.marketplace.usuario.Papel;

class AuthTest extends IntegracaoBase {

    @Autowired
    TokenService tokens;

    @Test
    void rejeitaEmailForaDoDominioESenhaCurta() {
        Resposta r = api.postJson("/auth/cadastro", null, """
                {"nome": "Zé", "email": "ze@gmail.com", "senha": "123", "cursoId": 1}""");

        assertThat(r.status()).isEqualTo(400);
        assertThat(r.<Map<String, String>>json("$.campos")).containsOnlyKeys("email", "senha");
        assertThat(r.<String>json("$.campos.email")).contains("@academico.ifpb.edu.br");
    }

    @Test
    void rejeitaCursoInexistente() {
        Resposta r = api.postJson("/auth/cadastro", null, """
                {"nome": "Zé", "email": "ze@academico.ifpb.edu.br", "senha": "123456", "cursoId": 99}""");

        assertThat(r.status()).isEqualTo(400);
        assertThat(r.<String>json("$.campos.cursoId")).isEqualTo("Curso não encontrado.");
    }

    @Test
    void cadastraNormalizandoEmailETelefoneEJaDevolveASessao() {
        Resposta r = api.postJson("/auth/cadastro", null, """
                {"nome": " Zé Teste ", "email": "Ze.Teste@ACADEMICO.ifpb.edu.br", "senha": "123456",
                 "cursoId": 3, "telefone": ""}""");

        assertThat(r.status()).isEqualTo(201);
        assertThat(r.<String>json("$.usuario.nome")).isEqualTo("Zé Teste");
        assertThat(r.<String>json("$.usuario.email")).isEqualTo("ze.teste@academico.ifpb.edu.br");
        assertThat(r.<Object>json("$.usuario.telefone")).isNull();
        assertThat(r.<String>json("$.usuario.papel")).isEqualTo("estudante");
        assertThat(r.<String>json("$.expiraEm")).isNotBlank();

        String token = r.json("$.token");
        assertThat(api.get("/usuarios/eu", token).<String>json("$.email")).isEqualTo("ze.teste@academico.ifpb.edu.br");
    }

    @Test
    void recusaEmailRepetidoSemDiferenciarMaiusculas() {
        String corpo = """
                {"nome": "Repetido", "email": "%s", "senha": "123456", "cursoId": 1}""";
        assertThat(api.postJson("/auth/cadastro", null, corpo.formatted("repetido@academico.ifpb.edu.br")).status())
                .isEqualTo(201);

        Resposta r = api.postJson("/auth/cadastro", null, corpo.formatted("REPETIDO@academico.ifpb.edu.br"));

        assertThat(r.status()).isEqualTo(409);
        assertThat(r.<String>json("$.campos.email")).isEqualTo("Este e-mail já está cadastrado.");
    }

    @Test
    void loginComOsDadosDaCarga() {
        Resposta r = api.postJson("/auth/login", null, """
                {"email": "%s", "senha": "senha123"}""".formatted(ANA));

        assertThat(r.status()).isEqualTo(200);
        assertThat(r.<String>json("$.token")).hasSizeGreaterThan(50);
        assertThat(r.<String>json("$.usuario.nome")).isEqualTo("Ana Silva");
    }

    @Test
    void loginComSenhaErradaDevolve401() {
        Resposta r = api.postJson("/auth/login", null, """
                {"email": "%s", "senha": "errada"}""".formatted(ANA));

        assertThat(r.status()).isEqualTo(401);
        assertThat(r.<String>json("$.mensagem")).isEqualTo("E-mail ou senha incorretos.");
    }

    @Test
    void semTokenOuComTokenInvalidoDevolve401EmJson() {
        Resposta semToken = api.get("/usuarios/eu", null);
        Resposta invalido = api.get("/usuarios/eu", "abc.def.ghi");

        assertThat(semToken.status()).isEqualTo(401);
        assertThat(semToken.<String>json("$.mensagem")).isEqualTo("Token ausente, inválido ou expirado.");
        assertThat(invalido.status()).isEqualTo(401);
    }

    @Test
    void tokenDeUsuarioQueNaoExisteMaisDevolve401() {
        String token = tokens.emitir(999, Papel.estudante).token();

        assertThat(api.get("/usuarios/eu", token).status()).isEqualTo(401);
    }
}

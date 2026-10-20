package br.edu.ifpb.marketplace;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;

import br.edu.ifpb.marketplace.Api.Formulario;

class EstadoAnuncioTest extends IntegracaoBase {

    private String dono;
    private long doacao;
    private int foto;

    @BeforeEach
    void criarDoacao() {
        dono = login(ESTUDANTE);
        Resposta r = api.multipart(HttpMethod.POST, "/anuncios", dono, new Formulario()
                .campo("titulo", "Cabo USB")
                .campo("descricao", "Cabo USB-C")
                .campo("modalidade", "doacao")
                .campo("estadoConservacao", "usado")
                .campo("categoriaId", 1)
                .campo("localEntrega", "Biblioteca")
                .arquivo("fotos", foto("anuncio-10-1.jpg"), "cabo.jpg"));
        doacao = r.<Integer>json("$.id");
        foto = r.json("$.fotos[0].id");
    }

    private Resposta alterar(long id, String token, String estado) {
        return api.patchJson("/anuncios/" + id + "/estado", token, "{\"estado\": \"" + estado + "\"}");
    }

    private List<Integer> doacoesNaBusca() {
        return api.get("/anuncios?modalidade=doacao&tamanho=50", dono).json("$.itens[*].id");
    }

    @Test
    void anuncioConcluidoSaiDaBuscaEVoltaQuandoReativado() {
        assertThat(doacoesNaBusca()).contains((int) doacao);

        assertThat(alterar(doacao, dono, "concluido").<String>json("$.estado")).isEqualTo("concluido");
        assertThat(doacoesNaBusca()).doesNotContain((int) doacao);

        assertThat(alterar(doacao, dono, "ativo").<String>json("$.estado")).isEqualTo("ativo");
        assertThat(doacoesNaBusca()).contains((int) doacao);
    }

    @Test
    void vendidoNaoExisteEmDoacao() {
        Resposta r = alterar(doacao, dono, "vendido");

        assertThat(r.status()).isEqualTo(400);
        assertThat(r.<String>json("$.campos.estado")).isEqualTo("Em doações, o estado final é 'concluido'.");
    }

    @Test
    void concluidoNaoExisteEmVenda() {
        assertThat(alterar(13, dono, "concluido").status()).isEqualTo(400);
    }

    @Test
    void estadoDesconhecidoDevolve400() {
        assertThat(alterar(doacao, dono, "xyz").status()).isEqualTo(400);
    }

    @Test
    void soOAnuncianteAlteraOEstado() {
        assertThat(alterar(doacao, outroEstudante(), "pausado").status()).isEqualTo(403);
    }

    @Test
    void naoTrocaParaVendaComEstadoQueSoExisteEmDoacao() {
        alterar(doacao, dono, "concluido");

        Resposta r = api.multipart(HttpMethod.PUT, "/anuncios/" + doacao, dono, new Formulario()
                .campo("titulo", "Cabo USB")
                .campo("descricao", "Cabo USB-C")
                .campo("modalidade", "venda")
                .campo("preco", 5)
                .campo("estadoConservacao", "usado")
                .campo("categoriaId", 1)
                .campo("localEntrega", "Biblioteca")
                .campo("fotosMantidas", foto));

        assertThat(r.status()).isEqualTo(400);
        assertThat(r.<String>json("$.campos.modalidade")).contains("Altere o estado");
    }
}

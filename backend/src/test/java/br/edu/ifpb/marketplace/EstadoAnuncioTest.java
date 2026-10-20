package br.edu.ifpb.marketplace;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;

import br.edu.ifpb.marketplace.Api.Formulario;

class EstadoAnuncioTest extends IntegracaoBase {

    private String carla;
    private long doacao;
    private int foto;

    @BeforeEach
    void criarDoacao() {
        carla = login(CARLA);
        Resposta r = api.multipart(HttpMethod.POST, "/anuncios", carla, new Formulario()
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
        return api.get("/anuncios?modalidade=doacao&tamanho=50", carla).json("$.itens[*].id");
    }

    @Test
    void anuncioConcluidoSaiDaBuscaEVoltaQuandoReativado() {
        assertThat(doacoesNaBusca()).contains((int) doacao);

        assertThat(alterar(doacao, carla, "concluido").<String>json("$.estado")).isEqualTo("concluido");
        assertThat(doacoesNaBusca()).doesNotContain((int) doacao);

        assertThat(alterar(doacao, carla, "ativo").<String>json("$.estado")).isEqualTo("ativo");
        assertThat(doacoesNaBusca()).contains((int) doacao);
    }

    @Test
    void vendidoNaoExisteEmDoacao() {
        Resposta r = alterar(doacao, carla, "vendido");

        assertThat(r.status()).isEqualTo(400);
        assertThat(r.<String>json("$.campos.estado")).isEqualTo("Em doações, o estado final é 'concluido'.");
    }

    @Test
    void concluidoNaoExisteEmVenda() {
        assertThat(alterar(13, login(CARLA), "concluido").status()).isEqualTo(400);
    }

    @Test
    void estadoDesconhecidoDevolve400() {
        assertThat(alterar(doacao, carla, "xyz").status()).isEqualTo(400);
    }

    @Test
    void soOAnuncianteAlteraOEstado() {
        assertThat(alterar(doacao, login(ANA), "pausado").status()).isEqualTo(403);
    }

    @Test
    void naoTrocaParaVendaComEstadoQueSoExisteEmDoacao() {
        alterar(doacao, carla, "concluido");

        Resposta r = api.multipart(HttpMethod.PUT, "/anuncios/" + doacao, carla, new Formulario()
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

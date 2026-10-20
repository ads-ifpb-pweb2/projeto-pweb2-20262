package br.edu.ifpb.marketplace;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

/** Só lê dados: as contagens vêm do carga.sql (9 vendas e 4 doações ativas). */
class BuscaTest extends IntegracaoBase {

    private String token;

    @BeforeEach
    void entrar() {
        token = login(ESTUDANTE);
    }

    private Resposta buscar(String query) {
        return api.get("/anuncios?" + query, token);
    }

    @Test
    void vendasAtivasMaisRecentesPrimeiroComPaginacaoPadrao() throws Exception {
        Resposta r = buscar("modalidade=venda");

        assertThat(r.status()).isEqualTo(200);
        assertThat(r.<Integer>json("$.total")).isEqualTo(9);
        assertThat(r.<Integer>json("$.pagina")).isEqualTo(1);
        assertThat(r.<Integer>json("$.tamanho")).isEqualTo(10);
        assertThat(r.<Integer>json("$.totalPaginas")).isEqualTo(1);
        assertThat(r.<List<String>>json("$.itens[*].estado")).containsOnly("ativo");
        assertThat(r.<List<Integer>>json("$.itens[*].id")).startsWith(18, 14, 13);
        assertThat(acessar(r.json("$.itens[0].capaUrl"))).isEqualTo("200 image/jpeg");
    }

    @Test
    void precoVemEmReaisComDuasCasas() {
        assertThat(buscar("modalidade=venda").corpo()).contains("\"preco\":200.00");
    }

    @Test
    void ordenaPorMenorPreco() {
        assertThat(buscar("modalidade=venda&ordem=preco&direcao=asc&tamanho=5").<List<Integer>>json("$.itens[*].id"))
                .containsExactly(2, 9, 1, 14, 7);
    }

    @Test
    void ordenaPorMaiorPreco() {
        assertThat(buscar("modalidade=venda&ordem=preco&direcao=desc").<Integer>json("$.itens[0].id")).isEqualTo(13);
    }

    @Test
    void ordemPorPrecoSemDirecaoComecaPeloMenor() {
        assertThat(buscar("modalidade=venda&ordem=preco").<Integer>json("$.itens[0].id")).isEqualTo(2);
    }

    @Test
    void ordenaPorDataCrescente() {
        assertThat(buscar("modalidade=venda&ordem=data&direcao=asc").<Integer>json("$.itens[0].id")).isEqualTo(1);
    }

    @Test
    void filtraPorCategoriaEFaixaDePreco() {
        Resposta r = buscar("modalidade=venda&categoria=eletronicos&precoMin=10&precoMax=100&ordem=preco&direcao=asc");

        assertThat(r.<List<Integer>>json("$.itens[*].id")).containsExactly(2, 9, 1, 14);
    }

    @Test
    void segundaPagina() {
        Resposta r = buscar("modalidade=venda&pagina=2&tamanho=5");

        assertThat(r.<List<?>>json("$.itens")).hasSize(4);
        assertThat(r.<Integer>json("$.pagina")).isEqualTo(2);
        assertThat(r.<Integer>json("$.totalPaginas")).isEqualTo(2);
    }

    @Test
    void paginaAlemDoFimVemVazia() {
        Resposta r = buscar("modalidade=venda&pagina=9");

        assertThat(r.status()).isEqualTo(200);
        assertThat(r.<List<?>>json("$.itens")).isEmpty();
    }

    @Test
    void categoriaInexistenteNaoEncontraNada() {
        assertThat(buscar("modalidade=venda&categoria=livros").<Integer>json("$.total")).isZero();
    }

    @Test
    void doacoesAtivasSemPreco() {
        Resposta r = buscar("modalidade=doacao");

        assertThat(r.<Integer>json("$.total")).isEqualTo(4);
        assertThat(r.<Integer>json("$.itens[0].id")).isEqualTo(17);
        assertThat(r.<Object>json("$.itens[0].preco")).isNull();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "modalidade=venda&tamanho=7",
            "modalidade=venda&pagina=0",
            "",
            "modalidade=troca",
            "modalidade=venda&ordem=nome",
            "modalidade=venda&precoMin=50&precoMax=10",
            "modalidade=venda&precoMin=-1",
            "modalidade=doacao&ordem=preco",
            "modalidade=doacao&precoMin=1"
    })
    void parametrosInvalidosDevolvem400(String query) {
        Resposta r = buscar(query);

        assertThat(r.status()).isEqualTo(400);
        assertThat(r.<String>json("$.mensagem")).isNotBlank();
    }

    @Test
    void buscaExigeToken() {
        assertThat(api.get("/anuncios?modalidade=venda", null).status()).isEqualTo(401);
    }
}

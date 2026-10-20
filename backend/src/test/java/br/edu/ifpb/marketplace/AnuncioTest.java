package br.edu.ifpb.marketplace;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;

import br.edu.ifpb.marketplace.Api.Formulario;

class AnuncioTest extends IntegracaoBase {

    private String dono;

    @BeforeEach
    void entrar() {
        dono = login(ESTUDANTE);
    }

    /** Campos válidos de um anúncio, sem modalidade, preço e fotos. */
    private static Formulario campos() {
        return new Formulario()
                .campo("titulo", "Mochila")
                .campo("descricao", "Mochila para notebook")
                .campo("estadoConservacao", "usado")
                .campo("categoriaId", 1)
                .campo("localEntrega", "Cantina");
    }

    private static Formulario venda(int fotos) {
        Formulario f = campos().campo("modalidade", "venda").campo("preco", "99.9");
        for (int i = 0; i < fotos; i++) {
            f.arquivo("fotos", foto("anuncio-01-1.jpg"), "foto" + i + ".jpg");
        }
        return f;
    }

    private Resposta criar(Formulario formulario) {
        return api.multipart(HttpMethod.POST, "/anuncios", dono, formulario);
    }

    private Resposta editar(long id, String token, Formulario formulario) {
        return api.multipart(HttpMethod.PUT, "/anuncios/" + id, token, formulario);
    }

    @Test
    void detalheComFotosEAnunciante() throws Exception {
        Resposta r = api.get("/anuncios/7", dono);

        assertThat(r.status()).isEqualTo(200);
        assertThat(r.<List<Boolean>>json("$.fotos[*].capa")).containsExactly(true, false, false);
        assertThat(r.<String>json("$.anunciante.nome")).isEqualTo("Estudante de Exemplo");
        assertThat(r.<String>json("$.categoria.slug")).isEqualTo("eletronicos");
        assertThat(acessar(r.json("$.fotos[1].url"))).isEqualTo("200 image/jpeg");
    }

    @Test
    void detalheDeAnuncioNaoAtivoDeOutroEstudante() {
        assertThat(api.get("/anuncios/5", outroEstudante()).<String>json("$.estado")).isEqualTo("vendido");
    }

    @Test
    void detalheInexistenteDevolve404() {
        assertThat(api.get("/anuncios/999", dono).status()).isEqualTo(404);
    }

    @Test
    void criaAnuncioAtivoComACapaEscolhida() throws Exception {
        Resposta r = criar(venda(2).campo("capaIndice", 1));

        assertThat(r.status()).isEqualTo(201);
        assertThat(r.<String>json("$.estado")).isEqualTo("ativo");
        assertThat(r.corpo()).contains("\"preco\":99.90");
        assertThat(r.<List<Boolean>>json("$.fotos[*].capa")).containsExactly(false, true);
        assertThat(r.<String>json("$.capaUrl")).isNotNull();
        assertThat(acessar(r.json("$.fotos[0].url"))).isEqualTo("200 image/jpeg");
        assertThat(r.<Integer>json("$.anunciante.id")).isEqualTo(1);
    }

    @Test
    void vendaSemPrecoDevolve400() {
        Resposta r = criar(campos().campo("modalidade", "venda").arquivo("fotos", foto("anuncio-01-1.jpg"), "a.jpg"));

        assertThat(r.status()).isEqualTo(400);
        assertThat(r.<String>json("$.campos.preco")).isEqualTo("Obrigatório em vendas.");
    }

    @Test
    void doacaoComPrecoDevolve400() {
        Resposta r = criar(campos().campo("modalidade", "doacao").campo("preco", 10)
                .arquivo("fotos", foto("anuncio-01-1.jpg"), "a.jpg"));

        assertThat(r.<String>json("$.campos.preco")).isEqualTo("Doações não têm preço; deixe em branco.");
    }

    @Test
    void camposObrigatoriosAusentes() {
        Resposta r = criar(new Formulario().arquivo("fotos", foto("anuncio-01-1.jpg"), "a.jpg"));

        assertThat(r.status()).isEqualTo(400);
        assertThat(r.<Map<String, String>>json("$.campos"))
                .containsKeys("titulo", "descricao", "modalidade", "estadoConservacao", "categoriaId", "localEntrega");
    }

    @Test
    void semFotosOuComMaisDeDezDevolve400() {
        assertThat(criar(venda(0)).<String>json("$.campos.fotos")).isEqualTo("Envie de 1 a 10 fotos.");
        assertThat(criar(venda(11)).status()).isEqualTo(400);
    }

    @Test
    void arquivoQueNaoEImagemDevolve400() {
        Resposta r = criar(campos().campo("modalidade", "doacao").arquivo("fotos", "texto".getBytes(), "a.jpg"));

        assertThat(r.<String>json("$.campos.fotos")).isEqualTo("Envie imagens JPEG, PNG ou WebP.");
    }

    @Test
    void capaIndiceForaDoIntervaloDevolve400() {
        assertThat(criar(venda(1).campo("capaIndice", 3)).<String>json("$.campos.capaIndice"))
                .isEqualTo("Deve ser de 0 a 0.");
    }

    @Test
    void categoriaInexistenteDevolve400() {
        Resposta r = criar(venda(1).campo("categoriaId", 9));

        assertThat(r.<String>json("$.campos.categoriaId")).isEqualTo("Categoria não encontrada.");
    }

    @Test
    void fotoComMaisDe5MbDevolve413() {
        byte[] grande = new byte[6 * 1024 * 1024];
        Resposta r = criar(campos().campo("modalidade", "doacao").arquivo("fotos", grande, "grande.jpg"));

        assertThat(r.status()).isEqualTo(413);
    }

    @Test
    void soOAnuncianteEdita() {
        Resposta criado = criar(venda(1));
        long id = criado.<Integer>json("$.id");
        int foto = criado.json("$.fotos[0].id");

        Resposta r = editar(id, outroEstudante(), venda(0).campo("fotosMantidas", foto));

        assertThat(r.status()).isEqualTo(403);
    }

    @Test
    void editaMantendoUmaFotoAdicionandoOutraETrocandoACapa() throws Exception {
        Resposta criado = criar(venda(2));
        long id = criado.<Integer>json("$.id");
        int primeira = criado.json("$.fotos[0].id");
        int segunda = criado.json("$.fotos[1].id");
        String urlPrimeira = criado.json("$.fotos[0].url");

        Resposta r = editar(id, dono, campos()
                .campo("titulo", "Mochila nova")
                .campo("modalidade", "venda")
                .campo("preco", 120)
                .campo("fotosMantidas", segunda)
                .arquivo("fotos", foto("anuncio-03-1.jpg"), "nova.jpg")
                .campo("capaIndice", 0));

        assertThat(r.status()).isEqualTo(200);
        assertThat(r.<String>json("$.titulo")).isEqualTo("Mochila nova");
        assertThat(r.corpo()).contains("\"preco\":120.00");
        assertThat(r.<List<Integer>>json("$.fotos[*].id")).hasSize(2).startsWith(segunda).doesNotContain(primeira);
        assertThat(r.<List<Boolean>>json("$.fotos[*].capa")).containsExactly(false, true);
        assertThat(acessar(urlPrimeira)).startsWith("404");
    }

    @Test
    void semCapaInformadaMantemACapaAtual() {
        Resposta criado = criar(venda(2).campo("capaIndice", 1));
        long id = criado.<Integer>json("$.id");
        int capa = criado.json("$.fotos[1].id");
        int outra = criado.json("$.fotos[0].id");

        Resposta r = editar(id, dono, venda(0).lista("fotosMantidas", outra, capa));

        assertThat(r.<List<Integer>>json("$.fotos[*].id")).containsExactly(outra, capa);
        assertThat(r.<List<Boolean>>json("$.fotos[*].capa")).containsExactly(false, true);
    }

    @Test
    void errosDeFotosNaEdicao() {
        Resposta criado = criar(venda(1));
        long id = criado.<Integer>json("$.id");
        int foto = criado.json("$.fotos[0].id");

        assertThat(editar(id, dono, venda(0)).<String>json("$.campos.fotos")).contains("1 a 10 fotos");
        assertThat(editar(id, dono, venda(0).campo("fotosMantidas", 1)).<String>json("$.campos.fotosMantidas"))
                .isEqualTo("A foto 1 não pertence a este anúncio.");
        assertThat(editar(id, dono, venda(1).campo("fotosMantidas", foto).campo("capaId", foto).campo("capaIndice", 0))
                .<String>json("$.mensagem")).isEqualTo("Informe capaId ou capaIndice, não os dois.");
        assertThat(editar(id, dono, venda(0).campo("fotosMantidas", foto).campo("capaId", 1))
                .<String>json("$.campos.capaId")).isEqualTo("A capa precisa ser uma das fotos mantidas.");
    }

    @Test
    void transformaVendaEmDoacao() {
        Resposta criado = criar(venda(1));
        long id = criado.<Integer>json("$.id");
        int foto = criado.json("$.fotos[0].id");

        Resposta r = editar(id, dono, campos().campo("modalidade", "doacao").campo("fotosMantidas", foto));

        assertThat(r.<String>json("$.modalidade")).isEqualTo("doacao");
        assertThat(r.<Object>json("$.preco")).isNull();
    }
}

package br.edu.ifpb.marketplace.anuncio;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import br.edu.ifpb.marketplace.armazenamento.Armazenamento;
import br.edu.ifpb.marketplace.armazenamento.Imagem;
import br.edu.ifpb.marketplace.catalogo.CatalogoRepositorio;
import br.edu.ifpb.marketplace.catalogo.Categoria;
import br.edu.ifpb.marketplace.comum.ErroApi;
import br.edu.ifpb.marketplace.comum.Pagina;
import br.edu.ifpb.marketplace.comum.Paginacao;
import br.edu.ifpb.marketplace.usuario.UsuarioService;

@Service
public class AnuncioService {

    private static final int MAX_FOTOS = 10;

    private final AnuncioRepositorio anuncios;
    private final CatalogoRepositorio catalogo;
    private final UsuarioService usuarios;
    private final Armazenamento armazenamento;

    AnuncioService(AnuncioRepositorio anuncios, CatalogoRepositorio catalogo, UsuarioService usuarios,
            Armazenamento armazenamento) {
        this.anuncios = anuncios;
        this.catalogo = catalogo;
        this.usuarios = usuarios;
        this.armazenamento = armazenamento;
    }

    /** Busca de vendas ou doações: só anúncios ativos. */
    public Pagina<AnuncioResumo> buscar(Modalidade modalidade, String categoria, BigDecimal precoMin,
            BigDecimal precoMax, Ordem ordem, Direcao direcao, Paginacao paginacao) {
        if (modalidade == Modalidade.doacao) {
            if (ordem == Ordem.preco) {
                throw ErroApi.campoInvalido("ordem", "Doações só podem ser ordenadas por data.");
            }
            if (precoMin != null || precoMax != null) {
                throw ErroApi.invalido("Doações não têm filtro de preço.");
            }
        }
        if (precoMin != null && precoMin.signum() < 0) {
            throw ErroApi.campoInvalido("precoMin", "Não pode ser negativo.");
        }
        if (precoMax != null && precoMax.signum() < 0) {
            throw ErroApi.campoInvalido("precoMax", "Não pode ser negativo.");
        }
        if (precoMin != null && precoMax != null && precoMin.compareTo(precoMax) > 0) {
            throw ErroApi.campoInvalido("precoMin", "Não pode ser maior que precoMax.");
        }
        Ordem o = ordem == null ? Ordem.data : ordem;
        // Sem direção: mais recentes primeiro na data, menor preço primeiro no preço
        Direcao d = direcao != null ? direcao : (o == Ordem.preco ? Direcao.asc : Direcao.desc);
        var filtro = new FiltroAnuncios(modalidade, categoria, centavosArredondadoParaCima(precoMin),
                centavosArredondadoParaBaixo(precoMax), null, true);
        return pagina(filtro, o, d, paginacao);
    }

    /** Anúncios de um estudante: o dono vê todos; os demais, só os ativos. */
    public Pagina<AnuncioResumo> doUsuario(long usuarioId, long quemPede, Paginacao paginacao) {
        usuarios.perfil(usuarioId);
        var filtro = new FiltroAnuncios(null, null, null, null, usuarioId, usuarioId != quemPede);
        return pagina(filtro, Ordem.data, Direcao.desc, paginacao);
    }

    public AnuncioDetalhe detalhe(long id) {
        AnuncioRegistro a = anuncios.porId(id)
                .orElseThrow(() -> ErroApi.naoEncontrado("Anúncio não encontrado."));
        List<FotoAnuncio> fotos = anuncios.fotos(id).stream()
                .map(f -> new FotoAnuncio(f.id(), armazenamento.url(f.chave()), f.capa()))
                .toList();
        return new AnuncioDetalhe(a.id(), a.titulo(), a.descricao(), a.modalidade(), reais(a.precoCentavos()),
                a.estado(), a.estadoConservacao(), categoria(a), a.localEntrega(), armazenamento.url(a.capaChave()),
                fotos, usuarios.perfil(a.usuarioId()), Instant.parse(a.publicadoEm()),
                Instant.parse(a.atualizadoEm()));
    }

    @Transactional
    public AnuncioDetalhe criar(long usuarioId, NovoAnuncioForm form) {
        Long precoCentavos = validar(form);
        List<Imagem> novas = imagens(form.fotos());
        if (novas.isEmpty() || novas.size() > MAX_FOTOS) {
            throw ErroApi.campoInvalido("fotos", "Envie de 1 a " + MAX_FOTOS + " fotos.");
        }
        int capa = form.capaIndice() == null ? 0 : form.capaIndice();
        if (capa < 0 || capa >= novas.size()) {
            throw ErroApi.campoInvalido("capaIndice", "Deve ser de 0 a " + (novas.size() - 1) + ".");
        }

        long id = anuncios.inserir(usuarioId, form, precoCentavos);
        List<String> chaves = enviar(id, novas);
        for (int i = 0; i < chaves.size(); i++) {
            anuncios.inserirFoto(id, chaves.get(i), i, i == capa);
        }
        return detalhe(id);
    }

    @Transactional
    public AnuncioDetalhe editar(long usuarioId, long id, EdicaoAnuncioForm form) {
        AnuncioRegistro atual = doDono(usuarioId, id, "editar");
        Long precoCentavos = validar(form);
        if (!atual.estado().permitidoEm(form.modalidade())) {
            throw ErroApi.campoInvalido("modalidade", "O estado atual (" + atual.estado()
                    + ") não existe nesta modalidade. Altere o estado antes de trocar a modalidade.");
        }

        Map<Long, FotoRegistro> fotosAtuais = anuncios.fotos(id).stream()
                .collect(Collectors.toMap(FotoRegistro::id, Function.identity()));
        List<Long> mantidas = form.fotosMantidas() == null
                ? List.of()
                : form.fotosMantidas().stream().filter(Objects::nonNull).toList();
        if (new HashSet<>(mantidas).size() != mantidas.size()) {
            throw ErroApi.campoInvalido("fotosMantidas", "Há ids repetidos.");
        }
        for (Long fotoId : mantidas) {
            if (!fotosAtuais.containsKey(fotoId)) {
                throw ErroApi.campoInvalido("fotosMantidas", "A foto " + fotoId + " não pertence a este anúncio.");
            }
        }
        List<Imagem> novas = imagens(form.fotos());
        int total = mantidas.size() + novas.size();
        if (total < 1 || total > MAX_FOTOS) {
            throw ErroApi.campoInvalido("fotos", "O anúncio deve ficar com 1 a " + MAX_FOTOS + " fotos (ficaria com "
                    + total + ").");
        }
        int capa = posicaoDaCapa(form, mantidas, novas.size(), fotosAtuais);

        anuncios.atualizar(id, form, precoCentavos);
        List<String> removidas = new ArrayList<>();
        for (FotoRegistro foto : fotosAtuais.values()) {
            if (!mantidas.contains(foto.id())) {
                anuncios.removerFoto(foto.id());
                removidas.add(foto.chave());
            }
        }
        anuncios.limparCapa(id);
        for (int i = 0; i < mantidas.size(); i++) {
            anuncios.atualizarFoto(mantidas.get(i), i, i == capa);
        }
        List<String> chaves = enviar(id, novas);
        for (int i = 0; i < chaves.size(); i++) {
            int ordem = mantidas.size() + i;
            anuncios.inserirFoto(id, chaves.get(i), ordem, ordem == capa);
        }
        // Os arquivos retirados só saem do bucket se a edição for gravada
        aoConfirmar(() -> removidas.forEach(armazenamento::remover));
        return detalhe(id);
    }

    @Transactional
    public AnuncioDetalhe alterarEstado(long usuarioId, long id, EstadoAnuncio estado) {
        AnuncioRegistro atual = doDono(usuarioId, id, "alterar o estado de");
        if (!estado.permitidoEm(atual.modalidade())) {
            throw ErroApi.campoInvalido("estado", atual.modalidade() == Modalidade.venda
                    ? "Em vendas, o estado final é 'vendido'."
                    : "Em doações, o estado final é 'concluido'.");
        }
        anuncios.atualizarEstado(id, estado);
        return detalhe(id);
    }

    private Pagina<AnuncioResumo> pagina(FiltroAnuncios filtro, Ordem ordem, Direcao direcao, Paginacao paginacao) {
        long total = anuncios.contar(filtro);
        List<AnuncioResumo> itens = anuncios.buscar(filtro, ordem, direcao, paginacao.offset(), paginacao.tamanho())
                .stream()
                .map(this::resumo)
                .toList();
        return Pagina.de(itens, paginacao, total);
    }

    private AnuncioResumo resumo(AnuncioRegistro a) {
        return new AnuncioResumo(a.id(), a.titulo(), a.modalidade(), reais(a.precoCentavos()), a.estado(),
                a.estadoConservacao(), categoria(a), armazenamento.url(a.capaChave()),
                new AnuncianteResumo(a.usuarioId(), a.usuarioNome()), Instant.parse(a.publicadoEm()));
    }

    private AnuncioRegistro doDono(long usuarioId, long id, String acao) {
        AnuncioRegistro anuncio = anuncios.porId(id)
                .orElseThrow(() -> ErroApi.naoEncontrado("Anúncio não encontrado."));
        if (anuncio.usuarioId() != usuarioId) {
            throw ErroApi.proibido("Só o anunciante pode " + acao + " este anúncio.");
        }
        return anuncio;
    }

    /** Valida categoria e preço; devolve o preço em centavos ({@code null} em doações). */
    private Long validar(DadosAnuncio dados) {
        if (!catalogo.categoriaExiste(dados.categoriaId())) {
            throw ErroApi.campoInvalido("categoriaId", "Categoria não encontrada.");
        }
        if (dados.modalidade() == Modalidade.doacao) {
            if (dados.preco() != null) {
                throw ErroApi.campoInvalido("preco", "Doações não têm preço; deixe em branco.");
            }
            return null;
        }
        if (dados.preco() == null) {
            throw ErroApi.campoInvalido("preco", "Obrigatório em vendas.");
        }
        if (dados.preco().signum() <= 0) {
            throw ErroApi.campoInvalido("preco", "Deve ser maior que zero.");
        }
        return dados.preco().movePointRight(2).longValueExact();
    }

    /** Posição da capa na ordem final (mantidas e depois novas). */
    private static int posicaoDaCapa(EdicaoAnuncioForm form, List<Long> mantidas, int novas,
            Map<Long, FotoRegistro> fotosAtuais) {
        if (form.capaId() != null && form.capaIndice() != null) {
            throw ErroApi.invalido("Informe capaId ou capaIndice, não os dois.");
        }
        if (form.capaId() != null) {
            int posicao = mantidas.indexOf(form.capaId());
            if (posicao < 0) {
                throw ErroApi.campoInvalido("capaId", "A capa precisa ser uma das fotos mantidas.");
            }
            return posicao;
        }
        if (form.capaIndice() != null) {
            if (form.capaIndice() < 0 || form.capaIndice() >= novas) {
                throw ErroApi.campoInvalido("capaIndice", novas == 0
                        ? "Não há fotos novas."
                        : "Deve ser de 0 a " + (novas - 1) + ".");
            }
            return mantidas.size() + form.capaIndice();
        }
        for (int i = 0; i < mantidas.size(); i++) {
            if (fotosAtuais.get(mantidas.get(i)).capa()) {
                return i;
            }
        }
        return 0;
    }

    private static List<Imagem> imagens(List<MultipartFile> arquivos) {
        if (arquivos == null) {
            return List.of();
        }
        // O Swagger UI e alguns formulários mandam uma parte vazia quando nenhum arquivo é escolhido
        return arquivos.stream().filter(f -> !f.isEmpty()).map(f -> Imagem.de(f, "fotos")).toList();
    }

    /** Envia as imagens ao bucket; se a transação for desfeita, elas são apagadas. */
    private List<String> enviar(long anuncioId, List<Imagem> imagens) {
        List<String> chaves = new ArrayList<>();
        aoDesfazer(() -> chaves.forEach(armazenamento::remover));
        for (Imagem imagem : imagens) {
            String chave = imagem.novaChave("anuncios/" + anuncioId);
            armazenamento.enviar(chave, imagem.conteudo(), imagem.tipo());
            chaves.add(chave);
        }
        return chaves;
    }

    private static void aoConfirmar(Runnable acao) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                acao.run();
            }
        });
    }

    private static void aoDesfazer(Runnable acao) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status == STATUS_ROLLED_BACK) {
                    acao.run();
                }
            }
        });
    }

    private static Categoria categoria(AnuncioRegistro a) {
        return new Categoria(a.categoriaId(), a.categoriaNome(), a.categoriaSlug());
    }

    private static BigDecimal reais(Long centavos) {
        return centavos == null ? null : BigDecimal.valueOf(centavos, 2);
    }

    // Filtros aceitam qualquer número de casas: precoMin=10.001 não deve incluir R$ 10,00
    private static Long centavosArredondadoParaCima(BigDecimal reais) {
        return reais == null ? null : reais.movePointRight(2).setScale(0, RoundingMode.CEILING).longValueExact();
    }

    private static Long centavosArredondadoParaBaixo(BigDecimal reais) {
        return reais == null ? null : reais.movePointRight(2).setScale(0, RoundingMode.FLOOR).longValueExact();
    }
}

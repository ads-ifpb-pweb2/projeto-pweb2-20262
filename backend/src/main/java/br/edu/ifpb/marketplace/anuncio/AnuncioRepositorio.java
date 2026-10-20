package br.edu.ifpb.marketplace.anuncio;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

@Repository
class AnuncioRepositorio {

    private static final String SELECT = """
            SELECT a.id, a.usuario_id, u.nome AS usuario_nome,
                   a.categoria_id, c.nome AS categoria_nome, c.slug AS categoria_slug,
                   a.titulo, a.descricao, a.modalidade, a.preco_centavos, a.estado_conservacao,
                   a.local_entrega, a.estado, a.publicado_em, a.atualizado_em, f.chave AS capa_chave
              FROM anuncio a
              JOIN usuario u ON u.id = a.usuario_id
              JOIN categoria c ON c.id = a.categoria_id
              LEFT JOIN anuncio_foto f ON f.anuncio_id = a.id AND f.capa = 1
            """;

    private static final String AGORA = "strftime('%Y-%m-%dT%H:%M:%SZ', 'now')";

    private final JdbcClient jdbc;

    AnuncioRepositorio(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    List<AnuncioRegistro> buscar(FiltroAnuncios filtro, Ordem ordem, Direcao direcao, int offset, int limite) {
        var params = new ArrayList<Object>();
        String where = where(filtro, params);
        String dir = direcao == Direcao.asc ? "ASC" : "DESC";
        // O id desempata anúncios publicados no mesmo segundo, para a paginação ser estável
        String orderBy = ordem == Ordem.preco
                ? "a.preco_centavos " + dir + ", a.publicado_em DESC, a.id DESC"
                : "a.publicado_em " + dir + ", a.id " + dir;
        params.add(limite);
        params.add(offset);
        return jdbc.sql(SELECT + where + " ORDER BY " + orderBy + " LIMIT ? OFFSET ?")
                .params(params)
                .query(AnuncioRegistro.class)
                .list();
    }

    long contar(FiltroAnuncios filtro) {
        var params = new ArrayList<Object>();
        String where = where(filtro, params);
        return jdbc.sql("SELECT COUNT(*) FROM anuncio a JOIN categoria c ON c.id = a.categoria_id" + where)
                .params(params)
                .query(Long.class)
                .single();
    }

    private static String where(FiltroAnuncios filtro, List<Object> params) {
        var condicoes = new ArrayList<String>();
        if (filtro.apenasAtivos()) {
            condicoes.add("a.estado = 'ativo'");
        }
        if (filtro.modalidade() != null) {
            condicoes.add("a.modalidade = ?");
            params.add(filtro.modalidade().name());
        }
        if (filtro.categoriaSlug() != null) {
            condicoes.add("c.slug = ?");
            params.add(filtro.categoriaSlug());
        }
        if (filtro.precoMinCentavos() != null) {
            condicoes.add("a.preco_centavos >= ?");
            params.add(filtro.precoMinCentavos());
        }
        if (filtro.precoMaxCentavos() != null) {
            condicoes.add("a.preco_centavos <= ?");
            params.add(filtro.precoMaxCentavos());
        }
        if (filtro.usuarioId() != null) {
            condicoes.add("a.usuario_id = ?");
            params.add(filtro.usuarioId());
        }
        return condicoes.isEmpty() ? "" : " WHERE " + String.join(" AND ", condicoes);
    }

    Optional<AnuncioRegistro> porId(long id) {
        return jdbc.sql(SELECT + " WHERE a.id = ?").param(id).query(AnuncioRegistro.class).optional();
    }

    List<FotoRegistro> fotos(long anuncioId) {
        return jdbc.sql("SELECT id, chave, ordem, capa FROM anuncio_foto WHERE anuncio_id = ? ORDER BY ordem, id")
                .param(anuncioId)
                .query(FotoRegistro.class)
                .list();
    }

    long inserir(long usuarioId, DadosAnuncio dados, Long precoCentavos) {
        var chave = new GeneratedKeyHolder();
        jdbc.sql("""
                INSERT INTO anuncio (usuario_id, categoria_id, titulo, descricao, modalidade, preco_centavos,
                                     estado_conservacao, local_entrega)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """)
                .params(usuarioId, dados.categoriaId(), dados.titulo().trim(), dados.descricao().trim(),
                        dados.modalidade().name(), precoCentavos, dados.estadoConservacao().name(),
                        dados.localEntrega().trim())
                .update(chave);
        return chave.getKey().longValue();
    }

    void atualizar(long id, DadosAnuncio dados, Long precoCentavos) {
        jdbc.sql("""
                UPDATE anuncio
                   SET categoria_id = ?, titulo = ?, descricao = ?, modalidade = ?, preco_centavos = ?,
                       estado_conservacao = ?, local_entrega = ?, atualizado_em = %s
                 WHERE id = ?
                """.formatted(AGORA))
                .params(dados.categoriaId(), dados.titulo().trim(), dados.descricao().trim(),
                        dados.modalidade().name(), precoCentavos, dados.estadoConservacao().name(),
                        dados.localEntrega().trim(), id)
                .update();
    }

    void atualizarEstado(long id, EstadoAnuncio estado) {
        jdbc.sql("UPDATE anuncio SET estado = ?, atualizado_em = " + AGORA + " WHERE id = ?")
                .params(estado.name(), id)
                .update();
    }

    void inserirFoto(long anuncioId, String chave, int ordem, boolean capa) {
        jdbc.sql("INSERT INTO anuncio_foto (anuncio_id, chave, ordem, capa) VALUES (?, ?, ?, ?)")
                .params(anuncioId, chave, ordem, capa ? 1 : 0)
                .update();
    }

    void atualizarFoto(long fotoId, int ordem, boolean capa) {
        jdbc.sql("UPDATE anuncio_foto SET ordem = ?, capa = ? WHERE id = ?")
                .params(ordem, capa ? 1 : 0, fotoId)
                .update();
    }

    /** Tira a marca de capa de todas as fotos, antes de marcar a nova (o índice só permite uma). */
    void limparCapa(long anuncioId) {
        jdbc.sql("UPDATE anuncio_foto SET capa = 0 WHERE anuncio_id = ?").param(anuncioId).update();
    }

    void removerFoto(long fotoId) {
        jdbc.sql("DELETE FROM anuncio_foto WHERE id = ?").param(fotoId).update();
    }
}

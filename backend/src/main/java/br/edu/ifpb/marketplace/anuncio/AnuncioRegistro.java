package br.edu.ifpb.marketplace.anuncio;

import br.edu.ifpb.marketplace.catalogo.EstadoConservacao;

/** Linha de anúncio com categoria, anunciante e capa. Uso interno. */
record AnuncioRegistro(
        long id,
        long usuarioId,
        String usuarioNome,
        long categoriaId,
        String categoriaNome,
        String categoriaSlug,
        String titulo,
        String descricao,
        Modalidade modalidade,
        Long precoCentavos,
        EstadoConservacao estadoConservacao,
        String localEntrega,
        EstadoAnuncio estado,
        String publicadoEm,
        String atualizadoEm,
        String capaChave) {
}

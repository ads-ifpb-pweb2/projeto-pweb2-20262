package br.edu.ifpb.marketplace.anuncio;

/** Filtros da busca e da lista de anúncios de um usuário. Campos nulos não filtram. */
record FiltroAnuncios(
        Modalidade modalidade,
        String categoriaSlug,
        Long precoMinCentavos,
        Long precoMaxCentavos,
        Long usuarioId,
        boolean apenasAtivos) {
}

package br.edu.ifpb.marketplace.anuncio;

import io.swagger.v3.oas.annotations.media.Schema;

public record FotoAnuncio(
        long id,
        @Schema(description = "URL assinada, válida por 1 hora") String url,
        boolean capa) {
}

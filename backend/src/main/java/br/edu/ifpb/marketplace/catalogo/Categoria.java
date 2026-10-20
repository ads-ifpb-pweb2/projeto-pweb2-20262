package br.edu.ifpb.marketplace.catalogo;

import io.swagger.v3.oas.annotations.media.Schema;

public record Categoria(
        long id,
        @Schema(example = "Eletrônicos") String nome,
        @Schema(description = "Valor do filtro `categoria` da busca", example = "eletronicos") String slug) {
}

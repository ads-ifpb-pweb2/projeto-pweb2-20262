package br.edu.ifpb.marketplace.catalogo;

import io.swagger.v3.oas.annotations.media.Schema;

public record OpcaoEstadoConservacao(
        @Schema(description = "Valor enviado à API", example = "seminovo") EstadoConservacao valor,
        @Schema(description = "Texto para exibir", example = "Seminovo") String rotulo) {
}

package br.edu.ifpb.marketplace.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Obrigatório.") @Schema(example = "ana.silva@academico.ifpb.edu.br") String email,
        @NotBlank(message = "Obrigatório.") @Schema(example = "senha123") String senha) {
}

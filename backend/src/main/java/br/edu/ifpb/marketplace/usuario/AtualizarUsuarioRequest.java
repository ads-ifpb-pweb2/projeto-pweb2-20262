package br.edu.ifpb.marketplace.usuario;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AtualizarUsuarioRequest(
        @NotBlank(message = "Obrigatório.") @Size(max = 100, message = "No máximo 100 caracteres.")
        @Schema(example = "Estudante de Exemplo") String nome,

        @NotNull(message = "Obrigatório.")
        @Schema(example = "1") Long cursoId,

        @Pattern(regexp = Telefone.REGEX, message = Telefone.MENSAGEM)
        @Schema(description = "Opcional. Vazio ou nulo remove o telefone.", example = "(83) 99999-0001", nullable = true)
        String telefone) {
}

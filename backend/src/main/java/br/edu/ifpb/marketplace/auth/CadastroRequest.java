package br.edu.ifpb.marketplace.auth;

import br.edu.ifpb.marketplace.usuario.Telefone;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CadastroRequest(
        @NotBlank(message = "Obrigatório.") @Size(max = 100, message = "No máximo 100 caracteres.")
        @Schema(example = "Ana Silva") String nome,

        @NotBlank(message = "Obrigatório.")
        @Email(message = "E-mail inválido.")
        @Pattern(regexp = "(?i).+@academico\\.ifpb\\.edu\\.br", message = "Use o e-mail institucional (@academico.ifpb.edu.br).")
        @Schema(example = "ana.silva@academico.ifpb.edu.br") String email,

        @NotBlank(message = "Obrigatório.") @Size(min = 6, max = 72, message = "Use de 6 a 72 caracteres.")
        @Schema(example = "senha123") String senha,

        @NotNull(message = "Obrigatório.")
        @Schema(example = "1") Long cursoId,

        @Pattern(regexp = Telefone.REGEX, message = Telefone.MENSAGEM)
        @Schema(description = "Opcional", example = "(83) 99999-0001", nullable = true) String telefone) {
}

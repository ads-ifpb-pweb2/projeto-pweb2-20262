package br.edu.ifpb.marketplace.usuario;

import br.edu.ifpb.marketplace.catalogo.Curso;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Perfil público de um estudante")
public record Perfil(
        long id,
        @Schema(example = "Estudante de Exemplo") String nome,
        Curso curso,
        @Schema(example = "(83) 99999-0001", nullable = true) String telefone,
        @Schema(description = "URL assinada, válida por 1 hora", nullable = true) String fotoUrl) {
}

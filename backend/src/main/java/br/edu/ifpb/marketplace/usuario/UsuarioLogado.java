package br.edu.ifpb.marketplace.usuario;

import br.edu.ifpb.marketplace.catalogo.Curso;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Dados do usuário logado")
public record UsuarioLogado(
        long id,
        @Schema(example = "Estudante de Exemplo") String nome,
        @Schema(example = "estudante@academico.ifpb.edu.br") String email,
        Curso curso,
        @Schema(example = "(83) 99999-0001", nullable = true) String telefone,
        @Schema(description = "URL assinada, válida por 1 hora", nullable = true) String fotoUrl,
        Papel papel) {
}

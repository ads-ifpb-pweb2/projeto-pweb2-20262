package br.edu.ifpb.marketplace.comum;

import java.util.Map;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Corpo de toda resposta de erro")
public record ErroResposta(
        @Schema(example = "Dados inválidos.") String mensagem,
        @Schema(description = "Erro de cada campo, quando houver", example = "{\"email\": \"Use o e-mail institucional (@academico.ifpb.edu.br).\"}")
        Map<String, String> campos) {

    public ErroResposta(String mensagem) {
        this(mensagem, Map.of());
    }
}

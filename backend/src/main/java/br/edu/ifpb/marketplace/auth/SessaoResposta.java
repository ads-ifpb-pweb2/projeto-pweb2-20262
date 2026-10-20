package br.edu.ifpb.marketplace.auth;

import java.time.Instant;

import br.edu.ifpb.marketplace.usuario.UsuarioLogado;
import io.swagger.v3.oas.annotations.media.Schema;

public record SessaoResposta(
        @Schema(description = "JWT para o header `Authorization: Bearer <token>`") String token,
        @Schema(description = "Quando o token expira") Instant expiraEm,
        UsuarioLogado usuario) {
}

package br.edu.ifpb.marketplace.anuncio;

import java.math.BigDecimal;
import java.time.Instant;

import br.edu.ifpb.marketplace.catalogo.Categoria;
import br.edu.ifpb.marketplace.catalogo.EstadoConservacao;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Anúncio nas listagens")
public record AnuncioResumo(
        long id,
        String titulo,
        Modalidade modalidade,
        @Schema(description = "Em reais; nulo em doações", example = "80.00", nullable = true) BigDecimal preco,
        EstadoAnuncio estado,
        EstadoConservacao estadoConservacao,
        Categoria categoria,
        @Schema(description = "URL assinada da foto de capa, válida por 1 hora") String capaUrl,
        AnuncianteResumo anunciante,
        Instant publicadoEm) {
}

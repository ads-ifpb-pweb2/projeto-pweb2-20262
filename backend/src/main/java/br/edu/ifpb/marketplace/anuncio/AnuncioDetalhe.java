package br.edu.ifpb.marketplace.anuncio;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import br.edu.ifpb.marketplace.catalogo.Categoria;
import br.edu.ifpb.marketplace.catalogo.EstadoConservacao;
import br.edu.ifpb.marketplace.usuario.Perfil;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Anúncio completo")
public record AnuncioDetalhe(
        long id,
        String titulo,
        String descricao,
        Modalidade modalidade,
        @Schema(description = "Em reais; nulo em doações", example = "80.00", nullable = true) BigDecimal preco,
        EstadoAnuncio estado,
        EstadoConservacao estadoConservacao,
        Categoria categoria,
        String localEntrega,
        @Schema(description = "URL assinada da foto de capa, válida por 1 hora") String capaUrl,
        @Schema(description = "Fotos na ordem de exibição") List<FotoAnuncio> fotos,
        Perfil anunciante,
        Instant publicadoEm,
        Instant atualizadoEm) {
}

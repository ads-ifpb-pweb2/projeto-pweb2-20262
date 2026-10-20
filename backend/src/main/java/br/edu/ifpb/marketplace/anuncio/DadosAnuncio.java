package br.edu.ifpb.marketplace.anuncio;

import java.math.BigDecimal;

import br.edu.ifpb.marketplace.catalogo.EstadoConservacao;

/** Campos comuns à criação e à edição de anúncio. */
public interface DadosAnuncio {

    String titulo();

    String descricao();

    Modalidade modalidade();

    BigDecimal preco();

    EstadoConservacao estadoConservacao();

    Long categoriaId();

    String localEntrega();
}

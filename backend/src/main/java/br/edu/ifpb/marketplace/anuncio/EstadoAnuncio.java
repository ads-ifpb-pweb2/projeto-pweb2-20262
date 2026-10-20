package br.edu.ifpb.marketplace.anuncio;

/** {@code vendido} só existe em vendas, e {@code concluido}, só em doações. */
public enum EstadoAnuncio {
    ativo,
    pausado,
    reservado,
    vendido,
    concluido;

    public boolean permitidoEm(Modalidade modalidade) {
        return switch (this) {
            case vendido -> modalidade == Modalidade.venda;
            case concluido -> modalidade == Modalidade.doacao;
            default -> true;
        };
    }
}

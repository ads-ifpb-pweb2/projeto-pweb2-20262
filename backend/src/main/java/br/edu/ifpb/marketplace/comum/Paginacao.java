package br.edu.ifpb.marketplace.comum;

import java.util.Set;

/** Parâmetros {@code pagina} (a partir de 1) e {@code tamanho} (5, 10, 25 ou 50) das listagens. */
public record Paginacao(int pagina, int tamanho) {

    private static final Set<Integer> TAMANHOS = Set.of(5, 10, 25, 50);

    public static Paginacao de(Integer pagina, Integer tamanho) {
        int p = pagina == null ? 1 : pagina;
        int t = tamanho == null ? 10 : tamanho;
        if (p < 1) {
            throw ErroApi.campoInvalido("pagina", "Deve ser 1 ou maior.");
        }
        if (!TAMANHOS.contains(t)) {
            throw ErroApi.campoInvalido("tamanho", "Use 5, 10, 25 ou 50.");
        }
        return new Paginacao(p, t);
    }

    public int offset() {
        return (pagina - 1) * tamanho;
    }
}

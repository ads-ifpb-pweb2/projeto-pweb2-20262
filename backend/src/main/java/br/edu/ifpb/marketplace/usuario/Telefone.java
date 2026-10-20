package br.edu.ifpb.marketplace.usuario;

public final class Telefone {

    /** Vazio, ou de 8 a 20 caracteres entre números, espaços, parênteses, + e -. */
    public static final String REGEX = "^$|^[0-9()+\\-\\s]{8,20}$";
    public static final String MENSAGEM = "Use de 8 a 20 caracteres: números, espaços, parênteses, + e -.";

    private Telefone() {
    }

    /** Telefone em branco é guardado como {@code null}. */
    public static String normalizar(String telefone) {
        return telefone == null || telefone.isBlank() ? null : telefone.trim();
    }
}

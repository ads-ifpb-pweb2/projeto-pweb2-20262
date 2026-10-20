package br.edu.ifpb.marketplace.catalogo;

/** As constantes têm o mesmo nome usado no JSON, na query string e no banco. */
public enum EstadoConservacao {
    novo("Novo"),
    seminovo("Seminovo"),
    usado("Usado");

    private final String rotulo;

    EstadoConservacao(String rotulo) {
        this.rotulo = rotulo;
    }

    public String rotulo() {
        return rotulo;
    }
}

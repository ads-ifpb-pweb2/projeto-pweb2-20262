package br.edu.ifpb.marketplace.usuario;

/** Linha da tabela usuario, com o nome do curso. Uso interno: nunca vai para o JSON. */
public record UsuarioRegistro(
        long id,
        String nome,
        String email,
        String senhaHash,
        Papel papel,
        Long cursoId,
        String cursoNome,
        String telefone,
        String fotoChave) {
}

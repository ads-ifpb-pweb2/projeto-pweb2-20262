package br.edu.ifpb.marketplace.usuario;

import java.util.Optional;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class UsuarioRepositorio {

    private static final String SELECT = """
            SELECT u.id, u.nome, u.email, u.senha_hash, u.papel, u.curso_id, c.nome AS curso_nome,
                   u.telefone, u.foto_chave
              FROM usuario u
              LEFT JOIN curso c ON c.id = u.curso_id
            """;

    private final JdbcClient jdbc;

    public UsuarioRepositorio(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<UsuarioRegistro> porId(long id) {
        return jdbc.sql(SELECT + " WHERE u.id = ?").param(id).query(UsuarioRegistro.class).optional();
    }

    public Optional<UsuarioRegistro> porEmail(String email) {
        return jdbc.sql(SELECT + " WHERE u.email = ?").param(email).query(UsuarioRegistro.class).optional();
    }

    public Optional<Papel> papel(long id) {
        return jdbc.sql("SELECT papel FROM usuario WHERE id = ?").param(id).query(Papel.class).optional();
    }

    public boolean emailExiste(String email) {
        return jdbc.sql("SELECT COUNT(*) FROM usuario WHERE email = ?").param(email).query(Integer.class).single() > 0;
    }

    public long inserir(String nome, String email, String senhaHash, long cursoId, String telefone) {
        var chave = new GeneratedKeyHolder();
        jdbc.sql("""
                INSERT INTO usuario (nome, email, senha_hash, papel, curso_id, telefone)
                VALUES (?, ?, ?, 'estudante', ?, ?)
                """)
                .params(nome, email, senhaHash, cursoId, telefone)
                .update(chave);
        return chave.getKey().longValue();
    }

    public void atualizar(long id, String nome, long cursoId, String telefone) {
        jdbc.sql("UPDATE usuario SET nome = ?, curso_id = ?, telefone = ? WHERE id = ?")
                .params(nome, cursoId, telefone, id)
                .update();
    }

    public void atualizarFoto(long id, String fotoChave) {
        jdbc.sql("UPDATE usuario SET foto_chave = ? WHERE id = ?").params(fotoChave, id).update();
    }
}

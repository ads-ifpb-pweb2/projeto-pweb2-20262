package br.edu.ifpb.marketplace.catalogo;

import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class CatalogoRepositorio {

    private final JdbcClient jdbc;

    public CatalogoRepositorio(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<Curso> cursos() {
        return jdbc.sql("SELECT id, nome FROM curso ORDER BY nome").query(Curso.class).list();
    }

    public Optional<Curso> curso(long id) {
        return jdbc.sql("SELECT id, nome FROM curso WHERE id = ?").param(id).query(Curso.class).optional();
    }

    public List<Categoria> categorias() {
        return jdbc.sql("SELECT id, nome, slug FROM categoria ORDER BY nome").query(Categoria.class).list();
    }

    public boolean categoriaExiste(long id) {
        return jdbc.sql("SELECT COUNT(*) FROM categoria WHERE id = ?").param(id).query(Integer.class).single() > 0;
    }
}

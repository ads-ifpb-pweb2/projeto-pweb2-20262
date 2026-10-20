package br.edu.ifpb.marketplace.banco;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.util.stream.Stream;

import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.FileSystemResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

import br.edu.ifpb.marketplace.armazenamento.Armazenamento;
import br.edu.ifpb.marketplace.config.AppProperties;
import jakarta.annotation.PostConstruct;

/**
 * Com o banco vazio, aplica {@code schema.sql} e {@code carga.sql} de {@code CARGA_DIR} e envia as fotos
 * de {@code CARGA_DIR/fotos} para o bucket, com a chave {@code carga/<arquivo>}.
 * Roda antes de a API começar a atender requisições.
 */
@Component
public class InicializadorBanco {

    private static final Logger log = LoggerFactory.getLogger(InicializadorBanco.class);

    private final DataSource dataSource;
    private final Armazenamento armazenamento;
    private final Path dir;

    public InicializadorBanco(DataSource dataSource, Armazenamento armazenamento, AppProperties props) {
        this.dataSource = dataSource;
        this.armazenamento = armazenamento;
        this.dir = Path.of(props.cargaDir());
    }

    @PostConstruct
    void inicializar() throws SQLException, IOException {
        if (!bancoVazio()) {
            log.info("Banco já inicializado; schema.sql e carga.sql não foram aplicados");
            return;
        }
        log.info("Banco vazio: aplicando {} e {}", dir.resolve("schema.sql"), dir.resolve("carga.sql"));
        var populator = new ResourceDatabasePopulator();
        populator.setSqlScriptEncoding(StandardCharsets.UTF_8.name());
        populator.addScript(new FileSystemResource(dir.resolve("schema.sql")));
        populator.addScript(new FileSystemResource(dir.resolve("carga.sql")));
        // Uma transação só: se a carga falhar, o banco continua vazio e a próxima subida tenta de novo
        try (Connection conexao = dataSource.getConnection()) {
            conexao.setAutoCommit(false);
            try {
                populator.populate(conexao);
                conexao.commit();
            } catch (RuntimeException e) {
                conexao.rollback();
                throw e;
            } finally {
                conexao.setAutoCommit(true);
            }
        }
        enviarFotosDaCarga();
    }

    private boolean bancoVazio() throws SQLException {
        try (Connection conexao = dataSource.getConnection();
                var rs = conexao.getMetaData().getTables(null, null, "usuario", new String[] {"TABLE"})) {
            return !rs.next();
        }
    }

    private void enviarFotosDaCarga() throws IOException {
        Path fotos = dir.resolve("fotos");
        if (!Files.isDirectory(fotos)) {
            return;
        }
        List<Path> arquivos;
        try (Stream<Path> lista = Files.list(fotos)) {
            arquivos = lista.filter(Files::isRegularFile).sorted().toList();
        }
        for (Path arquivo : arquivos) {
            String nome = arquivo.getFileName().toString();
            armazenamento.enviar("carga/" + nome, Files.readAllBytes(arquivo), tipo(nome));
        }
        log.info("{} fotos da carga enviadas ao armazenamento", arquivos.size());
    }

    private static String tipo(String nome) {
        String n = nome.toLowerCase();
        if (n.endsWith(".png")) {
            return "image/png";
        }
        if (n.endsWith(".webp")) {
            return "image/webp";
        }
        return "image/jpeg";
    }
}

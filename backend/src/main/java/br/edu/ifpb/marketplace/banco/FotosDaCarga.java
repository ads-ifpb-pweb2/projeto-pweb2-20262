package br.edu.ifpb.marketplace.banco;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Stream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import br.edu.ifpb.marketplace.armazenamento.Armazenamento;
import br.edu.ifpb.marketplace.config.AppProperties;
import jakarta.annotation.PostConstruct;

/**
 * Envia para o bucket as fotos de {@code CARGA_DIR/fotos} que ainda não estão lá, com a chave
 * {@code carga/<arquivo>}, que é a usada pelas migrações de carga. As migrações em si são aplicadas pelo Flyway.
 * Roda antes de a API começar a atender requisições.
 */
@Component
public class FotosDaCarga {

    private static final Logger log = LoggerFactory.getLogger(FotosDaCarga.class);

    private final Armazenamento armazenamento;
    private final Path dir;

    public FotosDaCarga(Armazenamento armazenamento, AppProperties props) {
        this.armazenamento = armazenamento;
        this.dir = Path.of(props.cargaDir()).resolve("fotos");
    }

    @PostConstruct
    void enviar() throws IOException {
        if (!Files.isDirectory(dir)) {
            return;
        }
        List<Path> arquivos;
        try (Stream<Path> lista = Files.list(dir)) {
            arquivos = lista.filter(Files::isRegularFile).sorted().toList();
        }
        int enviadas = 0;
        for (Path arquivo : arquivos) {
            String nome = arquivo.getFileName().toString();
            String chave = "carga/" + nome;
            if (!armazenamento.existe(chave)) {
                armazenamento.enviar(chave, Files.readAllBytes(arquivo), tipo(nome));
                enviadas++;
            }
        }
        if (enviadas > 0) {
            log.info("{} fotos da carga enviadas ao armazenamento", enviadas);
        }
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

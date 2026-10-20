package br.edu.ifpb.marketplace.armazenamento;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import br.edu.ifpb.marketplace.comum.ErroApi;

/** Imagem enviada pelo usuário, com o tipo identificado pelo conteúdo do arquivo. */
public record Imagem(byte[] conteudo, String tipo, String extensao) {

    /**
     * Lê e valida o arquivo. Aceita JPEG, PNG e WebP; o limite de 5 MB é aplicado pelo Spring
     * ({@code spring.servlet.multipart.max-file-size}).
     */
    public static Imagem de(MultipartFile arquivo, String campo) {
        byte[] bytes;
        try {
            bytes = arquivo.getBytes();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        if (comeca(bytes, 0, 0xFF, 0xD8, 0xFF)) {
            return new Imagem(bytes, "image/jpeg", "jpg");
        }
        if (comeca(bytes, 0, 0x89, 'P', 'N', 'G')) {
            return new Imagem(bytes, "image/png", "png");
        }
        if (comeca(bytes, 0, 'R', 'I', 'F', 'F') && comeca(bytes, 8, 'W', 'E', 'B', 'P')) {
            return new Imagem(bytes, "image/webp", "webp");
        }
        throw ErroApi.campoInvalido(campo, "Envie imagens JPEG, PNG ou WebP.");
    }

    /** Chave única no bucket, por exemplo {@code anuncios/12/3f2a….jpg}. */
    public String novaChave(String pasta) {
        return pasta + "/" + UUID.randomUUID() + "." + extensao;
    }

    private static boolean comeca(byte[] bytes, int inicio, int... assinatura) {
        if (bytes.length < inicio + assinatura.length) {
            return false;
        }
        for (int i = 0; i < assinatura.length; i++) {
            if ((bytes[inicio + i] & 0xFF) != assinatura[i]) {
                return false;
            }
        }
        return true;
    }
}

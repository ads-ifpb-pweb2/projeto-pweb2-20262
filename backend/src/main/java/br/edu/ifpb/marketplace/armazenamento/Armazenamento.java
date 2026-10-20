package br.edu.ifpb.marketplace.armazenamento;

import java.net.URI;
import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import br.edu.ifpb.marketplace.config.AppProperties;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.checksums.RequestChecksumCalculation;
import software.amazon.awssdk.core.checksums.ResponseChecksumValidation;
import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

/** Fotos no armazenamento compatível com S3 (RustFS no Docker Compose). */
@Component
public class Armazenamento {

    private static final Logger log = LoggerFactory.getLogger(Armazenamento.class);
    private static final Duration VALIDADE_URL = Duration.ofHours(1);
    private static final int TENTATIVAS = 15;

    private final String bucket;
    private final S3Client cliente;
    private final S3Presigner assinador;

    public Armazenamento(AppProperties props) {
        AppProperties.S3 s3 = props.s3();
        var credenciais = StaticCredentialsProvider.create(AwsBasicCredentials.create(s3.accessKey(), s3.secretKey()));
        this.bucket = s3.bucket();
        this.cliente = S3Client.builder()
                .endpointOverride(URI.create(s3.endpoint()))
                .region(Region.US_EAST_1)
                .credentialsProvider(credenciais)
                .forcePathStyle(true)
                .requestChecksumCalculation(RequestChecksumCalculation.WHEN_REQUIRED)
                .responseChecksumValidation(ResponseChecksumValidation.WHEN_REQUIRED)
                .build();
        // A assinatura inclui o host, então as URLs são assinadas com o endereço que o navegador acessa
        this.assinador = S3Presigner.builder()
                .endpointOverride(URI.create(s3.urlPublica()))
                .region(Region.US_EAST_1)
                .credentialsProvider(credenciais)
                .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build())
                .build();
    }

    /** Cria o bucket se ele não existir, tentando de novo enquanto o armazenamento sobe. */
    @PostConstruct
    void garantirBucket() throws InterruptedException {
        for (int tentativa = 1; ; tentativa++) {
            try {
                try {
                    cliente.headBucket(b -> b.bucket(bucket));
                } catch (NoSuchBucketException e) {
                    cliente.createBucket(b -> b.bucket(bucket));
                    log.info("Bucket '{}' criado", bucket);
                }
                return;
            } catch (SdkException e) {
                if (tentativa == TENTATIVAS) {
                    throw new IllegalStateException("Armazenamento de fotos indisponível: " + e.getMessage(), e);
                }
                log.warn("Armazenamento indisponível (tentativa {}/{}): {}", tentativa, TENTATIVAS, e.getMessage());
                Thread.sleep(2000);
            }
        }
    }

    public void enviar(String chave, byte[] conteudo, String tipo) {
        cliente.putObject(b -> b.bucket(bucket).key(chave).contentType(tipo), RequestBody.fromBytes(conteudo));
    }

    /**
     * Remove sem propagar erro: um objeto que sobrou no bucket não deve desfazer a operação.
     * As fotos da carga ({@code carga/}) nunca são removidas, porque o carga.sql pode reutilizá-las.
     */
    public void remover(String chave) {
        if (chave.startsWith("carga/")) {
            return;
        }
        try {
            cliente.deleteObject(b -> b.bucket(bucket).key(chave));
        } catch (SdkException e) {
            log.warn("Não foi possível remover '{}': {}", chave, e.getMessage());
        }
    }

    /** URL assinada válida por 1 hora, ou {@code null} se não houver foto. */
    public String url(String chave) {
        if (chave == null) {
            return null;
        }
        return assinador.presignGetObject(p -> p.signatureDuration(VALIDADE_URL)
                .getObjectRequest(g -> g.bucket(bucket).key(chave)))
                .url().toString();
    }

    @PreDestroy
    void fechar() {
        cliente.close();
        assinador.close();
    }
}

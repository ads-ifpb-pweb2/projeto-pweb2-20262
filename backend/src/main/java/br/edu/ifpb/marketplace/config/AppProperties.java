package br.edu.ifpb.marketplace.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("app")
public record AppProperties(String cargaDir, Jwt jwt, S3 s3) {

    public record Jwt(String segredo, int expiracaoHoras) {
    }

    /** {@code endpoint} é usado pela API; {@code urlPublica} assina as URLs que o navegador acessa. */
    public record S3(String endpoint, String urlPublica, String bucket, String accessKey, String secretKey) {
    }
}

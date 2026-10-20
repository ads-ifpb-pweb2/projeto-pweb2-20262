package br.edu.ifpb.marketplace.auth;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.stereotype.Service;

import com.nimbusds.jose.jwk.source.ImmutableSecret;

import br.edu.ifpb.marketplace.config.AppProperties;
import br.edu.ifpb.marketplace.usuario.Papel;

/** Emite e valida os JWT (HS256, assinados com {@code JWT_SECRET}). */
@Service
public class TokenService {

    private static final String EMISSOR = "marketplace-ifpb";

    private final JwtEncoder encoder;
    private final JwtDecoder decoder;
    private final Duration validade;

    public TokenService(AppProperties props) {
        String segredo = props.jwt().segredo();
        if (segredo == null || segredo.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT_SECRET precisa ter pelo menos 32 caracteres");
        }
        SecretKey chave = new SecretKeySpec(segredo.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        this.encoder = new NimbusJwtEncoder(new ImmutableSecret<>(chave));
        this.decoder = NimbusJwtDecoder.withSecretKey(chave).macAlgorithm(MacAlgorithm.HS256).build();
        this.validade = Duration.ofHours(props.jwt().expiracaoHoras());
    }

    public SessaoToken emitir(long usuarioId, Papel papel) {
        Instant agora = Instant.now();
        Instant expiraEm = agora.plus(validade);
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(EMISSOR)
                .subject(Long.toString(usuarioId))
                .issuedAt(agora)
                .expiresAt(expiraEm)
                .claim("papel", papel.name())
                .build();
        String token = encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims))
                .getTokenValue();
        return new SessaoToken(token, expiraEm);
    }

    public JwtDecoder decoder() {
        return decoder;
    }

    public record SessaoToken(String token, Instant expiraEm) {
    }
}

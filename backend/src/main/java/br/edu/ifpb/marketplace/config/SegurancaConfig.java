package br.edu.ifpb.marketplace.config;

import java.io.IOException;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import br.edu.ifpb.marketplace.auth.TokenService;
import br.edu.ifpb.marketplace.usuario.UsuarioRepositorio;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
public class SegurancaConfig {

    @Bean
    SecurityFilterChain seguranca(HttpSecurity http, TokenService tokens, UsuarioRepositorio usuarios) throws Exception {
        AuthenticationEntryPoint naoAutenticado = (req, res, e) ->
                responder(res, HttpServletResponse.SC_UNAUTHORIZED, "Token ausente, inválido ou expirado.");
        AccessDeniedHandler semPermissao = (req, res, e) ->
                responder(res, HttpServletResponse.SC_FORBIDDEN, "Sem permissão para este recurso.");

        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/cadastro", "/auth/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/cursos", "/categorias", "/estados-conservacao").permitAll()
                        .requestMatchers("/", "/error", "/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .anyRequest().hasRole("estudante"))
                .oauth2ResourceServer(o -> o
                        .authenticationEntryPoint(naoAutenticado)
                        .jwt(jwt -> jwt
                                .decoder(tokens.decoder())
                                // O papel vem do banco: um token de usuário que não existe mais é recusado
                                .jwtAuthenticationConverter(token -> {
                                    long id;
                                    try {
                                        id = Long.parseLong(token.getSubject());
                                    } catch (NumberFormatException e) {
                                        throw new BadCredentialsException("Token inválido");
                                    }
                                    var papel = usuarios.papel(id)
                                            .orElseThrow(() -> new BadCredentialsException("Usuário não existe"));
                                    return new JwtAuthenticationToken(token,
                                            List.of(new SimpleGrantedAuthority("ROLE_" + papel.name())),
                                            token.getSubject());
                                })))
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(naoAutenticado)
                        .accessDeniedHandler(semPermissao));
        return http.build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /** Libera o frontend rodando em qualquer porta de localhost (Vite, Storybook etc.). */
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        var config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("http://localhost:[*]", "http://127.0.0.1:[*]"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setMaxAge(3600L);
        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    private static void responder(HttpServletResponse res, int status, String mensagem) throws IOException {
        res.setStatus(status);
        res.setContentType("application/json;charset=UTF-8");
        res.getWriter().write("{\"mensagem\":\"" + mensagem + "\",\"campos\":{}}");
    }
}

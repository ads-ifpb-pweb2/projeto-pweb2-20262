package br.edu.ifpb.marketplace.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI openApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Marketplace IFPB Cajazeiras")
                        .version("etapa 1")
                        .description("""
                                API do projeto de PWEB2 (2026.2).

                                - Faça login em `POST /auth/login` (ou cadastre-se em `POST /auth/cadastro`), \
                                copie o `token` e clique em **Authorize**.
                                - Erros têm sempre o formato `{ "mensagem": "...", "campos": { "campo": "erro" } }`.
                                - Listagens aceitam `pagina` (a partir de 1) e `tamanho` (5, 10, 25 ou 50; padrão 10) e \
                                respondem `{ itens, pagina, tamanho, total, totalPaginas }`.
                                - URLs de foto são assinadas e valem 1 hora."""))
                .components(new Components().addSecuritySchemes("bearer",
                        new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList("bearer"));
    }

    /** {@code http://localhost:8080} abre a documentação. */
    @Controller
    @Hidden
    static class RaizController {

        @GetMapping("/")
        String raiz() {
            return "redirect:/swagger-ui.html";
        }
    }
}

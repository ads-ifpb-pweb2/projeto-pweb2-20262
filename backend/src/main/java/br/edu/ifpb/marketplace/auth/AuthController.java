package br.edu.ifpb.marketplace.auth;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
@Tag(name = "Autenticação", description = "Cadastro e login de estudantes. Públicos, sem token.")
@SecurityRequirements
public class AuthController {

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/cadastro")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Cadastra um estudante e já devolve a sessão",
            description = "Aceita só e-mails `@academico.ifpb.edu.br`.")
    @ApiResponse(responseCode = "201", description = "Cadastrado")
    @ApiResponse(responseCode = "400", description = "Dados inválidos")
    @ApiResponse(responseCode = "409", description = "E-mail já cadastrado")
    public SessaoResposta cadastrar(@Valid @RequestBody CadastroRequest dados) {
        return service.cadastrar(dados);
    }

    @PostMapping("/login")
    @Operation(summary = "Login de estudante")
    @ApiResponse(responseCode = "200", description = "Autenticado")
    @ApiResponse(responseCode = "401", description = "E-mail ou senha incorretos")
    public SessaoResposta login(@Valid @RequestBody LoginRequest dados) {
        return service.login(dados);
    }
}

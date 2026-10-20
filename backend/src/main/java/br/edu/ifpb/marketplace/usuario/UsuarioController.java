package br.edu.ifpb.marketplace.usuario;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.edu.ifpb.marketplace.anuncio.AnuncioResumo;
import br.edu.ifpb.marketplace.anuncio.AnuncioService;
import br.edu.ifpb.marketplace.auth.Sessao;
import br.edu.ifpb.marketplace.comum.Pagina;
import br.edu.ifpb.marketplace.comum.Paginacao;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/usuarios")
@Tag(name = "Usuários", description = "Usuário logado e perfis de estudantes")
public class UsuarioController {

    private final UsuarioService service;
    private final AnuncioService anuncios;

    public UsuarioController(UsuarioService service, AnuncioService anuncios) {
        this.service = service;
        this.anuncios = anuncios;
    }

    @GetMapping("/eu")
    @Operation(summary = "Usuário logado", description = "Para restaurar a sessão ao recarregar a página.")
    @ApiResponse(responseCode = "401", description = "Token ausente, inválido ou expirado")
    public UsuarioLogado eu() {
        return service.logado(Sessao.usuarioId());
    }

    @PutMapping("/eu")
    @Operation(summary = "Edita os próprios dados", description = "O e-mail não pode ser alterado.")
    public UsuarioLogado atualizar(@Valid @RequestBody AtualizarUsuarioRequest dados) {
        return service.atualizar(Sessao.usuarioId(), dados);
    }

    @PutMapping(path = "/eu/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Envia ou troca a foto de perfil", description = "JPEG, PNG ou WebP, com até 5 MB.")
    @ApiResponse(responseCode = "413", description = "Foto com mais de 5 MB")
    public UsuarioLogado atualizarFoto(@RequestPart("foto") MultipartFile foto) {
        return service.atualizarFoto(Sessao.usuarioId(), foto);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Perfil de um estudante")
    @ApiResponse(responseCode = "404", description = "Estudante não encontrado")
    public Perfil perfil(@PathVariable long id) {
        return service.perfil(id);
    }

    @GetMapping("/{id}/anuncios")
    @Operation(summary = "Anúncios de um estudante, mais recentes primeiro",
            description = "O próprio estudante vê todos os seus anúncios; os demais veem só os ativos.")
    @ApiResponse(responseCode = "404", description = "Estudante não encontrado")
    public Pagina<AnuncioResumo> anuncios(
            @PathVariable long id,
            @Parameter(description = "A partir de 1. Padrão: 1") @RequestParam(required = false) Integer pagina,
            @Parameter(description = "5, 10, 25 ou 50. Padrão: 10") @RequestParam(required = false) Integer tamanho) {
        return anuncios.doUsuario(id, Sessao.usuarioId(), Paginacao.de(pagina, tamanho));
    }
}

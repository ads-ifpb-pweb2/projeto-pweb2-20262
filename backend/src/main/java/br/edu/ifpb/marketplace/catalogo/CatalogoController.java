package br.edu.ifpb.marketplace.catalogo;

import java.util.Arrays;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Listas", description = "Valores para os formulários. Públicas, sem token.")
@SecurityRequirements
public class CatalogoController {

    private final CatalogoRepositorio repositorio;

    public CatalogoController(CatalogoRepositorio repositorio) {
        this.repositorio = repositorio;
    }

    @GetMapping("/cursos")
    @Operation(summary = "Cursos do campus, para o cadastro e a edição do perfil")
    public List<Curso> cursos() {
        return repositorio.cursos();
    }

    @GetMapping("/categorias")
    @Operation(summary = "Categorias de anúncio", description = "Definidas por cada equipe nas migrações de `backend/db/migration`.")
    public List<Categoria> categorias() {
        return repositorio.categorias();
    }

    @GetMapping("/estados-conservacao")
    @Operation(summary = "Estados de conservação aceitos no anúncio")
    public List<OpcaoEstadoConservacao> estadosConservacao() {
        return Arrays.stream(EstadoConservacao.values())
                .map(e -> new OpcaoEstadoConservacao(e, e.rotulo()))
                .toList();
    }
}

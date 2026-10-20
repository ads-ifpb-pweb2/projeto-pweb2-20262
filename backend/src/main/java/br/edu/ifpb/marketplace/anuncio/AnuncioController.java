package br.edu.ifpb.marketplace.anuncio;

import java.math.BigDecimal;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.edu.ifpb.marketplace.auth.Sessao;
import br.edu.ifpb.marketplace.comum.Pagina;
import br.edu.ifpb.marketplace.comum.Paginacao;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/anuncios")
@Tag(name = "Anúncios", description = "Busca, criação, edição e estado dos anúncios")
public class AnuncioController {

    private final AnuncioService service;

    public AnuncioController(AnuncioService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Busca de vendas ou de doações (só anúncios ativos)",
            description = "Sem `ordem`, mostra os mais recentes primeiro. Em doações, só há ordenação por data "
                    + "e não há filtro de preço.")
    public Pagina<AnuncioResumo> buscar(
            @Parameter(description = "`venda` ou `doacao`", required = true) @RequestParam Modalidade modalidade,
            @Parameter(description = "Slug da categoria", example = "eletronicos") @RequestParam(required = false) String categoria,
            @Parameter(description = "Preço mínimo em reais (só vendas)") @RequestParam(required = false) BigDecimal precoMin,
            @Parameter(description = "Preço máximo em reais (só vendas)") @RequestParam(required = false) BigDecimal precoMax,
            @Parameter(description = "`data` (padrão) ou `preco`") @RequestParam(required = false) Ordem ordem,
            @Parameter(description = "`asc` ou `desc`. Padrão: `desc` para data e `asc` para preço")
            @RequestParam(required = false) Direcao direcao,
            @Parameter(description = "A partir de 1. Padrão: 1") @RequestParam(required = false) Integer pagina,
            @Parameter(description = "5, 10, 25 ou 50. Padrão: 10") @RequestParam(required = false) Integer tamanho) {
        return service.buscar(modalidade, categoria, precoMin, precoMax, ordem, direcao,
                Paginacao.de(pagina, tamanho));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalhe do anúncio, em qualquer estado")
    @ApiResponse(responseCode = "404", description = "Anúncio não encontrado")
    public AnuncioDetalhe detalhe(@PathVariable long id) {
        return service.detalhe(id);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Cria um anúncio, já ativo",
            description = "multipart/form-data com os campos do anúncio e de 1 a 10 arquivos no campo `fotos`.")
    @ApiResponse(responseCode = "201", description = "Criado")
    @ApiResponse(responseCode = "400", description = "Dados inválidos")
    @ApiResponse(responseCode = "413", description = "Foto com mais de 5 MB")
    public AnuncioDetalhe criar(@Valid @ModelAttribute NovoAnuncioForm form) {
        return service.criar(Sessao.usuarioId(), form);
    }

    @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Edita um anúncio (só o anunciante)",
            description = "Envia todos os campos de novo. `fotosMantidas` lista as fotos atuais que continuam; "
                    + "`fotos` traz as novas.")
    @ApiResponse(responseCode = "400", description = "Dados inválidos")
    @ApiResponse(responseCode = "403", description = "Não é o anunciante")
    @ApiResponse(responseCode = "404", description = "Anúncio não encontrado")
    public AnuncioDetalhe editar(@PathVariable long id, @Valid @ModelAttribute EdicaoAnuncioForm form) {
        return service.editar(Sessao.usuarioId(), id, form);
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Altera o estado do anúncio (só o anunciante)")
    @ApiResponse(responseCode = "400", description = "Estado inválido para a modalidade")
    @ApiResponse(responseCode = "403", description = "Não é o anunciante")
    @ApiResponse(responseCode = "404", description = "Anúncio não encontrado")
    public AnuncioDetalhe alterarEstado(@PathVariable long id, @Valid @RequestBody AlterarEstadoRequest dados) {
        return service.alterarEstado(Sessao.usuarioId(), id, dados.estado());
    }
}

package br.edu.ifpb.marketplace.anuncio;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import br.edu.ifpb.marketplace.catalogo.EstadoConservacao;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record EdicaoAnuncioForm(
        @NotBlank(message = "Obrigatório.") @Size(max = 100, message = "No máximo 100 caracteres.")
        @Schema(example = "Fone de ouvido Bluetooth") String titulo,

        @NotBlank(message = "Obrigatório.") @Size(max = 2000, message = "No máximo 2000 caracteres.")
        @Schema(example = "Pouco uso, bateria dura cerca de 8 horas.") String descricao,

        @NotNull(message = "Obrigatório.") Modalidade modalidade,

        @Digits(integer = 7, fraction = 2, message = "Use até 2 casas decimais.")
        @Schema(description = "Obrigatório em vendas; vazio em doações", example = "80.00") BigDecimal preco,

        @NotNull(message = "Obrigatório.") EstadoConservacao estadoConservacao,

        @NotNull(message = "Obrigatório.") @Schema(example = "1") Long categoriaId,

        @NotBlank(message = "Obrigatório.") @Size(max = 200, message = "No máximo 200 caracteres.")
        @Schema(example = "Bloco de Informática, intervalo da manhã") String localEntrega,

        @Schema(description = "Ids das fotos atuais que continuam no anúncio, na ordem de exibição. "
                + "As fotos atuais que não estiverem aqui são removidas.")
        List<Long> fotosMantidas,

        @Schema(description = "Fotos novas, exibidas depois das mantidas. O total fica entre 1 e 10.")
        List<MultipartFile> fotos,

        @Schema(description = "Id de uma foto mantida para ser a capa. Use este campo ou `capaIndice`.")
        Long capaId,

        @Schema(description = "Posição (a partir de 0) em `fotos` da foto nova que será a capa. "
                + "Sem `capaId` e sem `capaIndice`, a capa atual continua, se tiver sido mantida; senão, a primeira foto.")
        Integer capaIndice) implements DadosAnuncio {
}

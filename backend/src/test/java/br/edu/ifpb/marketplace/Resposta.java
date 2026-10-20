package br.edu.ifpb.marketplace;

import org.springframework.http.HttpHeaders;

import com.jayway.jsonpath.JsonPath;

public record Resposta(int status, String corpo, HttpHeaders headers) {

    /** Lê um valor do corpo JSON, por exemplo {@code json("$.itens[0].id")}. */
    public <T> T json(String caminho) {
        return JsonPath.read(corpo, caminho);
    }
}

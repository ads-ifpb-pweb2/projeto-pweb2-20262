package br.edu.ifpb.marketplace.comum;

import java.util.Map;

import org.springframework.http.HttpStatus;

/** Erro de regra de negócio, convertido em resposta JSON pelo {@link TratadorErros}. */
public class ErroApi extends RuntimeException {

    private final HttpStatus status;
    private final Map<String, String> campos;

    private ErroApi(HttpStatus status, String mensagem, Map<String, String> campos) {
        super(mensagem);
        this.status = status;
        this.campos = campos;
    }

    public static ErroApi invalido(String mensagem) {
        return new ErroApi(HttpStatus.BAD_REQUEST, mensagem, Map.of());
    }

    public static ErroApi campoInvalido(String campo, String mensagem) {
        return new ErroApi(HttpStatus.BAD_REQUEST, "Dados inválidos.", Map.of(campo, mensagem));
    }

    public static ErroApi conflito(String campo, String mensagem) {
        return new ErroApi(HttpStatus.CONFLICT, mensagem, Map.of(campo, mensagem));
    }

    public static ErroApi naoAutenticado(String mensagem) {
        return new ErroApi(HttpStatus.UNAUTHORIZED, mensagem, Map.of());
    }

    public static ErroApi proibido(String mensagem) {
        return new ErroApi(HttpStatus.FORBIDDEN, mensagem, Map.of());
    }

    public static ErroApi naoEncontrado(String mensagem) {
        return new ErroApi(HttpStatus.NOT_FOUND, mensagem, Map.of());
    }

    public HttpStatus getStatus() {
        return status;
    }

    public Map<String, String> getCampos() {
        return campos;
    }
}

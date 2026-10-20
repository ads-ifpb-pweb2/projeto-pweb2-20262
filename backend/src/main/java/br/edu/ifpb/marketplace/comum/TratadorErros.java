package br.edu.ifpb.marketplace.comum;

import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class TratadorErros {

    private static final Logger log = LoggerFactory.getLogger(TratadorErros.class);

    @ExceptionHandler(ErroApi.class)
    ResponseEntity<ErroResposta> erroApi(ErroApi e) {
        return ResponseEntity.status(e.getStatus()).body(new ErroResposta(e.getMessage(), e.getCampos()));
    }

    // Validação de @Valid em @RequestBody e @ModelAttribute (MethodArgumentNotValidException estende BindException)
    @ExceptionHandler(BindException.class)
    ResponseEntity<ErroResposta> validacao(BindException e) {
        Map<String, String> campos = new LinkedHashMap<>();
        for (FieldError erro : e.getFieldErrors()) {
            String mensagem = erro.isBindingFailure() ? "Valor inválido." : erro.getDefaultMessage();
            campos.putIfAbsent(erro.getField(), mensagem);
        }
        return badRequest(new ErroResposta("Dados inválidos.", campos));
    }

    @ExceptionHandler(HandlerMethodValidationException.class)
    ResponseEntity<ErroResposta> validacaoParametros(HandlerMethodValidationException e) {
        Map<String, String> campos = new LinkedHashMap<>();
        e.getParameterValidationResults().forEach(resultado -> campos.putIfAbsent(
                resultado.getMethodParameter().getParameterName(),
                resultado.getResolvableErrors().getFirst().getDefaultMessage()));
        return badRequest(new ErroResposta("Dados inválidos.", campos));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    ResponseEntity<ErroResposta> tipoInvalido(MethodArgumentTypeMismatchException e) {
        return badRequest(new ErroResposta("Dados inválidos.", Map.of(e.getName(), "Valor inválido.")));
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    ResponseEntity<ErroResposta> parametroAusente(MissingServletRequestParameterException e) {
        return badRequest(new ErroResposta("Dados inválidos.", Map.of(e.getParameterName(), "Obrigatório.")));
    }

    @ExceptionHandler(MissingServletRequestPartException.class)
    ResponseEntity<ErroResposta> parteAusente(MissingServletRequestPartException e) {
        return badRequest(new ErroResposta("Dados inválidos.", Map.of(e.getRequestPartName(), "Obrigatório.")));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ErroResposta> corpoInvalido(HttpMessageNotReadableException e) {
        return badRequest(new ErroResposta("Corpo da requisição ausente ou com JSON inválido."));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    ResponseEntity<ErroResposta> arquivoGrande(MaxUploadSizeExceededException e) {
        return ResponseEntity.status(HttpStatus.CONTENT_TOO_LARGE)
                .body(new ErroResposta("Cada foto pode ter no máximo 5 MB."));
    }

    @ExceptionHandler(MultipartException.class)
    ResponseEntity<ErroResposta> multipartInvalido(MultipartException e) {
        return badRequest(new ErroResposta("Envie os dados como multipart/form-data."));
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    ResponseEntity<ErroResposta> tipoDeConteudo(HttpMediaTypeNotSupportedException e) {
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                .body(new ErroResposta("Content-Type não suportado: " + e.getContentType() + "."));
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    ResponseEntity<ErroResposta> metodo(HttpRequestMethodNotSupportedException e) {
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(new ErroResposta("Método " + e.getMethod() + " não suportado neste caminho."));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    ResponseEntity<ErroResposta> caminho(NoResourceFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErroResposta("Caminho não encontrado."));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ErroResposta> inesperado(Exception e) {
        log.error("Erro inesperado", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErroResposta("Erro interno no servidor."));
    }

    private static ResponseEntity<ErroResposta> badRequest(ErroResposta corpo) {
        return ResponseEntity.badRequest().body(corpo);
    }
}

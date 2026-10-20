package br.edu.ifpb.marketplace.auth;

import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.ifpb.marketplace.comum.ErroApi;
import br.edu.ifpb.marketplace.usuario.Papel;
import br.edu.ifpb.marketplace.usuario.Telefone;
import br.edu.ifpb.marketplace.usuario.UsuarioRegistro;
import br.edu.ifpb.marketplace.usuario.UsuarioRepositorio;
import br.edu.ifpb.marketplace.usuario.UsuarioService;

@Service
public class AuthService {

    private final UsuarioRepositorio usuarios;
    private final UsuarioService usuarioService;
    private final PasswordEncoder senhas;
    private final TokenService tokens;

    public AuthService(UsuarioRepositorio usuarios, UsuarioService usuarioService, PasswordEncoder senhas,
            TokenService tokens) {
        this.usuarios = usuarios;
        this.usuarioService = usuarioService;
        this.senhas = senhas;
        this.tokens = tokens;
    }

    @Transactional
    public SessaoResposta cadastrar(CadastroRequest dados) {
        String email = normalizar(dados.email());
        if (usuarios.emailExiste(email)) {
            throw ErroApi.conflito("email", "Este e-mail já está cadastrado.");
        }
        usuarioService.validarCurso(dados.cursoId());
        long id = usuarios.inserir(dados.nome().trim(), email, senhas.encode(dados.senha()), dados.cursoId(),
                Telefone.normalizar(dados.telefone()));
        return sessao(id, Papel.estudante);
    }

    /** Login de estudante. O administrador terá login próprio (etapa 2). */
    public SessaoResposta login(LoginRequest dados) {
        UsuarioRegistro usuario = usuarios.porEmail(normalizar(dados.email()))
                .filter(u -> u.papel() == Papel.estudante)
                .filter(u -> senhas.matches(dados.senha(), u.senhaHash()))
                .orElseThrow(() -> ErroApi.naoAutenticado("E-mail ou senha incorretos."));
        return sessao(usuario.id(), usuario.papel());
    }

    private SessaoResposta sessao(long id, Papel papel) {
        TokenService.SessaoToken token = tokens.emitir(id, papel);
        return new SessaoResposta(token.token(), token.expiraEm(), usuarioService.logado(id));
    }

    private static String normalizar(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}

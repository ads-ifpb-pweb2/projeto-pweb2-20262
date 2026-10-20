package br.edu.ifpb.marketplace.usuario;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import br.edu.ifpb.marketplace.armazenamento.Armazenamento;
import br.edu.ifpb.marketplace.armazenamento.Imagem;
import br.edu.ifpb.marketplace.catalogo.CatalogoRepositorio;
import br.edu.ifpb.marketplace.catalogo.Curso;
import br.edu.ifpb.marketplace.comum.ErroApi;

@Service
public class UsuarioService {

    private final UsuarioRepositorio usuarios;
    private final CatalogoRepositorio catalogo;
    private final Armazenamento armazenamento;

    public UsuarioService(UsuarioRepositorio usuarios, CatalogoRepositorio catalogo, Armazenamento armazenamento) {
        this.usuarios = usuarios;
        this.catalogo = catalogo;
        this.armazenamento = armazenamento;
    }

    public UsuarioLogado logado(long id) {
        return usuarios.porId(id)
                .map(this::paraLogado)
                .orElseThrow(() -> ErroApi.naoAutenticado("Sessão inválida. Faça login novamente."));
    }

    /** Perfil de um estudante; administradores não têm perfil público. */
    public Perfil perfil(long id) {
        return usuarios.porId(id)
                .filter(u -> u.papel() == Papel.estudante)
                .map(u -> new Perfil(u.id(), u.nome(), curso(u), u.telefone(), armazenamento.url(u.fotoChave())))
                .orElseThrow(() -> ErroApi.naoEncontrado("Estudante não encontrado."));
    }

    @Transactional
    public UsuarioLogado atualizar(long id, AtualizarUsuarioRequest dados) {
        validarCurso(dados.cursoId());
        usuarios.atualizar(id, dados.nome().trim(), dados.cursoId(), Telefone.normalizar(dados.telefone()));
        return logado(id);
    }

    public UsuarioLogado atualizarFoto(long id, MultipartFile foto) {
        if (foto == null || foto.isEmpty()) {
            throw ErroApi.campoInvalido("foto", "Obrigatório.");
        }
        Imagem imagem = Imagem.de(foto, "foto");
        String anterior = usuarios.porId(id).map(UsuarioRegistro::fotoChave).orElse(null);
        String chave = imagem.novaChave("usuarios/" + id);
        armazenamento.enviar(chave, imagem.conteudo(), imagem.tipo());
        usuarios.atualizarFoto(id, chave);
        if (anterior != null) {
            armazenamento.remover(anterior);
        }
        return logado(id);
    }

    public void validarCurso(long cursoId) {
        if (catalogo.curso(cursoId).isEmpty()) {
            throw ErroApi.campoInvalido("cursoId", "Curso não encontrado.");
        }
    }

    UsuarioLogado paraLogado(UsuarioRegistro u) {
        return new UsuarioLogado(u.id(), u.nome(), u.email(), curso(u), u.telefone(),
                armazenamento.url(u.fotoChave()), u.papel());
    }

    private static Curso curso(UsuarioRegistro u) {
        return u.cursoId() == null ? null : new Curso(u.cursoId(), u.cursoNome());
    }
}

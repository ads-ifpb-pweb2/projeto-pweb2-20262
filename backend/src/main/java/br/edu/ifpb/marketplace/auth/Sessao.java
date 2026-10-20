package br.edu.ifpb.marketplace.auth;

import org.springframework.security.core.context.SecurityContextHolder;

/** Acesso ao usuário da requisição atual (o {@code sub} do JWT). */
public final class Sessao {

    private Sessao() {
    }

    public static long usuarioId() {
        return Long.parseLong(SecurityContextHolder.getContext().getAuthentication().getName());
    }
}

import { request } from './client'
import type { CadastroRequest, LoginRequest, SessaoResposta, UsuarioLogado } from './types'

export const cadastrar = (dados: CadastroRequest) =>
  request<SessaoResposta>('/auth/cadastro', { method: 'POST', body: dados, publica: true })

export const entrar = (dados: LoginRequest) =>
  request<SessaoResposta>('/auth/login', { method: 'POST', body: dados, publica: true })

/** Restaura a sessão ao recarregar a página (exige token) */
export const buscarUsuarioLogado = () => request<UsuarioLogado>('/usuarios/eu')

import { request } from './client'
import type { AnuncioResumo, AtualizarUsuarioRequest, Pagina, Perfil, UsuarioLogado } from './types'

export const buscarPerfil = (id: number) => request<Perfil>(`/usuarios/${id}`)

/** O próprio usuário vê todos os seus anúncios; os demais veem só os ativos (regra do backend) */
export const listarAnunciosDoUsuario = (id: number, pagina = 1, tamanho = 10) =>
  request<Pagina<AnuncioResumo>>(`/usuarios/${id}/anuncios`, { query: { pagina, tamanho } })

export const atualizarUsuario = (dados: AtualizarUsuarioRequest) =>
  request<UsuarioLogado>('/usuarios/eu', { method: 'PUT', body: dados })

export function atualizarFoto(foto: File) {
  const form = new FormData()
  form.append('foto', foto)
  return request<UsuarioLogado>('/usuarios/eu/foto', { method: 'PUT', body: form })
}

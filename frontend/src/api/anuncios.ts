import { request } from './client'
import type {
  AnuncioDetalhe,
  AnuncioResumo,
  DadosAnuncioForm,
  EstadoAnuncio,
  FiltrosBusca,
  Modalidade,
  Pagina,
} from './types'

/** Busca em /vendas e /doacoes. Só traz anúncios ativos (regra do backend). */
export const buscarAnuncios = (modalidade: Modalidade, filtros: FiltrosBusca = {}) =>
  request<Pagina<AnuncioResumo>>('/anuncios', { query: { modalidade, ...filtros } })

export const buscarAnuncio = (id: number) => request<AnuncioDetalhe>(`/anuncios/${id}`)

export const alterarEstado = (id: number, estado: EstadoAnuncio) =>
  request<AnuncioDetalhe>(`/anuncios/${id}/estado`, { method: 'PATCH', body: { estado } })

/** O backend recebe multipart/form-data (campos + arquivos no campo `fotos`) */
function montarForm(d: DadosAnuncioForm): FormData {
  const form = new FormData()
  form.append('titulo', d.titulo)
  form.append('descricao', d.descricao)
  form.append('modalidade', d.modalidade)
  if (d.modalidade === 'venda' && d.preco) form.append('preco', d.preco) // doação: não envia preço
  form.append('estadoConservacao', d.estadoConservacao)
  form.append('categoriaId', String(d.categoriaId))
  form.append('localEntrega', d.localEntrega)
  d.fotos.forEach((f) => form.append('fotos', f))
  if (d.capaIndice !== undefined) form.append('capaIndice', String(d.capaIndice))
  d.fotosMantidas?.forEach((id) => form.append('fotosMantidas', String(id)))
  if (d.capaId !== undefined) form.append('capaId', String(d.capaId))
  return form
}

export const criarAnuncio = (dados: DadosAnuncioForm) =>
  request<AnuncioDetalhe>('/anuncios', { method: 'POST', body: montarForm(dados) })

/** Envie todos os campos de novo. `fotosMantidas` = fotos atuais que continuam; `fotos` = novas. */
export const editarAnuncio = (id: number, dados: DadosAnuncioForm) =>
  request<AnuncioDetalhe>(`/anuncios/${id}`, { method: 'PUT', body: montarForm(dados) })

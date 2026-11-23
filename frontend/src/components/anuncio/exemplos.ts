import type { AnuncioResumo } from '../../api/types'

const capa =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#c9d8d0"/></svg>',
  )

/** Dado de exemplo para as stories. Fica fora dos .stories.tsx: o Storybook trata todo export de lá como uma story. */
export const anuncioExemplo: AnuncioResumo = {
  id: 1,
  titulo: 'Calculadora científica Casio fx-82',
  modalidade: 'venda',
  preco: 45,
  estado: 'ativo',
  estadoConservacao: 'usado',
  categoria: { id: 1, nome: 'Material escolar', slug: 'material-escolar' },
  capaUrl: capa,
  anunciante: { id: 1, nome: 'Maria da Silva' },
  publicadoEm: '2026-11-10T14:30:00Z',
}

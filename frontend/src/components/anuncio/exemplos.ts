import type { AnuncioResumo, Categoria, FotoAnuncio } from '../../api/types'

const criarSvg = (cor: string, texto?: string) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450"><rect width="600" height="450" fill="${cor}"/>${
      texto
        ? `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#1c2321" font-family="sans-serif" font-size="28">${texto}</text>`
        : ''
    }</svg>`,
  )

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

export const categoriasExemplo: Categoria[] = [
  { id: 1, nome: 'Eletrônicos', slug: 'eletronicos' },
  { id: 2, nome: 'Livros e apostilas', slug: 'livros-e-apostilas' },
  { id: 3, nome: 'Material escolar', slug: 'material-escolar' },
  { id: 4, nome: 'Móveis', slug: 'moveis' },
]

export const fotosExemplo: FotoAnuncio[] = [
  { id: 10, url: criarSvg('#c9d8d0', 'Foto 1 (Capa)'), capa: true },
  { id: 11, url: criarSvg('#d5e2db', 'Foto 2'), capa: false },
  { id: 12, url: criarSvg('#e0ebe5', 'Foto 3'), capa: false },
]

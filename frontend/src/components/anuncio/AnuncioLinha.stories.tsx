import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { AnuncioLinha } from './AnuncioLinha'

const capa =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#c9d8d0"/></svg>')

export const anuncioExemplo = {
  id: 1,
  titulo: 'Calculadora científica Casio fx-82',
  modalidade: 'venda' as const,
  preco: 45,
  estado: 'ativo' as const,
  estadoConservacao: 'usado' as const,
  categoria: { id: 1, nome: 'Material escolar', slug: 'material-escolar' },
  capaUrl: capa,
  anunciante: { id: 1, nome: 'Maria da Silva' },
  publicadoEm: '2026-11-10T14:30:00Z',
}

const meta = {
  title: 'Anuncio/AnuncioLinha (provisório)',
  component: AnuncioLinha,
  args: { anuncio: anuncioExemplo },
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof AnuncioLinha>
export default meta
type Story = StoryObj<typeof meta>

export const Venda: Story = {}
export const Doacao: Story = { args: { anuncio: { ...anuncioExemplo, modalidade: 'doacao', preco: null, titulo: 'Livro de Cálculo I' } } }
export const Reservado: Story = { args: { anuncio: { ...anuncioExemplo, estado: 'reservado' } } }

import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { ListaAnunciosUsuario } from './ListaAnunciosUsuario'
import { anuncioExemplo } from '../anuncio/exemplos'

const itens = [
  anuncioExemplo,
  { ...anuncioExemplo, id: 2, titulo: 'Livro de Cálculo I', modalidade: 'doacao' as const, preco: null, estado: 'reservado' as const },
  { ...anuncioExemplo, id: 3, titulo: 'Mochila 30L', preco: 80, estado: 'vendido' as const },
]

const meta = {
  title: 'Perfil/ListaAnunciosUsuario',
  component: ListaAnunciosUsuario,
  args: {
    anuncios: { itens, pagina: 1, tamanho: 10, total: 3, totalPaginas: 1 },
    carregando: false, erro: null, pagina: 1, tamanho: 10, onPagina: () => {}, onTamanho: () => {},
  },
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ListaAnunciosUsuario>
export default meta
type Story = StoryObj<typeof meta>

export const ComAnuncios: Story = {}
export const VariasPaginas: Story = { args: { anuncios: { itens, pagina: 2, tamanho: 5, total: 14, totalPaginas: 3 }, pagina: 2, tamanho: 5 } }
export const Trocando: Story = { args: { carregando: true } }
export const Carregando: Story = { args: { anuncios: null, carregando: true } }
export const Vazio: Story = { args: { anuncios: { itens: [], pagina: 1, tamanho: 10, total: 0, totalPaginas: 0 } } }
export const ComErro: Story = { args: { anuncios: null, erro: 'Não foi possível carregar os anúncios.' } }

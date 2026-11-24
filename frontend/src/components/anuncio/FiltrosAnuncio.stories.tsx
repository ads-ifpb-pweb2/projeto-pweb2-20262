import type { Meta, StoryObj } from '@storybook/react-vite'
import { FiltrosAnuncio } from './FiltrosAnuncio'
import { categoriasExemplo } from './exemplos'

const meta = {
  title: 'Anuncio/FiltrosAnuncio',
  component: FiltrosAnuncio,
  args: {
    modalidade: 'venda',
    categorias: categoriasExemplo,
    categoria: '',
    precoMin: '',
    precoMax: '',
    ordem: 'data',
    direcao: 'desc',
    onAplicar: () => {},
    onLimpar: () => {},
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FiltrosAnuncio>

export default meta
type Story = StoryObj<typeof meta>

export const Vendas: Story = {}

export const VendasComFiltros: Story = {
  args: {
    categoria: 'eletronicos',
    precoMin: '10',
    precoMax: '50',
    ordem: 'preco',
    direcao: 'asc',
  },
}

export const Doacoes: Story = {
  args: {
    modalidade: 'doacao',
    categoria: 'livros-e-apostilas',
    ordem: 'data',
    direcao: 'asc',
  },
}

export const ComErroPreco: Story = {
  args: {
    precoMin: '100',
    precoMax: '50',
    erroPreco: 'O preço mínimo não pode ser maior que o máximo.',
  },
}

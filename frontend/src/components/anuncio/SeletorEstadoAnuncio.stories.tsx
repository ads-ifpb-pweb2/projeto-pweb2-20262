import type { Meta, StoryObj } from '@storybook/react-vite'
import { SeletorEstadoAnuncio } from './SeletorEstadoAnuncio'

const meta = {
  title: 'Anuncio/SeletorEstadoAnuncio',
  component: SeletorEstadoAnuncio,
  args: {
    estadoAtual: 'ativo',
    modalidade: 'venda',
    onAlterar: () => {},
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SeletorEstadoAnuncio>

export default meta
type Story = StoryObj<typeof meta>

export const VendaAtivo: Story = {}

export const DoacaoAtivo: Story = {
  args: {
    modalidade: 'doacao',
  },
}

export const VendaVendido: Story = {
  args: {
    estadoAtual: 'vendido',
  },
}

export const Carregando: Story = {
  args: {
    carregando: true,
  },
}

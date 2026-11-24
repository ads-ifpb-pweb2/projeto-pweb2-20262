import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { CardAnuncio } from './CardAnuncio'
import { anuncioExemplo } from './exemplos'

const meta = {
  title: 'Anuncio/CardAnuncio',
  component: CardAnuncio,
  args: { anuncio: anuncioExemplo },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ maxWidth: 300 }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CardAnuncio>

export default meta
type Story = StoryObj<typeof meta>

export const Venda: Story = {}

export const Doacao: Story = {
  args: {
    anuncio: {
      ...anuncioExemplo,
      id: 2,
      modalidade: 'doacao',
      preco: null,
      titulo: 'Livro de Cálculo I — James Stewart',
      estadoConservacao: 'seminovo',
    },
  },
}

export const Reservado: Story = {
  args: {
    anuncio: {
      ...anuncioExemplo,
      estado: 'reservado',
    },
  },
}

export const Pausado: Story = {
  args: {
    anuncio: {
      ...anuncioExemplo,
      estado: 'pausado',
    },
  },
}

export const Vendido: Story = {
  args: {
    anuncio: {
      ...anuncioExemplo,
      estado: 'vendido',
    },
  },
}

export const Concluido: Story = {
  args: {
    anuncio: {
      ...anuncioExemplo,
      modalidade: 'doacao',
      preco: null,
      estado: 'concluido',
    },
  },
}

export const SemSeloEstado: Story = {
  args: {
    mostrarEstado: false,
  },
}

export const TituloLongo: Story = {
  args: {
    anuncio: {
      ...anuncioExemplo,
      titulo: 'Kit completo de Arduino Uno R3 com protoboard, jumpers, sensores e fonte 9V para laboratório',
      estadoConservacao: 'novo',
    },
  },
}

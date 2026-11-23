import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { AnuncioLinha } from './AnuncioLinha'
import { anuncioExemplo } from './exemplos'


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

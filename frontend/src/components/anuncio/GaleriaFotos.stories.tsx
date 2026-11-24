import type { Meta, StoryObj } from '@storybook/react-vite'
import { GaleriaFotos } from './GaleriaFotos'
import { fotosExemplo } from './exemplos'

const meta = {
  title: 'Anuncio/GaleriaFotos',
  component: GaleriaFotos,
  args: {
    fotos: fotosExemplo,
    titulo: 'Calculadora científica Casio fx-82',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 520 }}>
        <Story />
      </div>
    ),
  ],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof GaleriaFotos>

export default meta
type Story = StoryObj<typeof meta>

export const VariasFotos: Story = {}

export const FotoUnica: Story = {
  args: {
    fotos: [fotosExemplo[0]],
  },
}

export const SemFotos: Story = {
  args: {
    fotos: [],
  },
}

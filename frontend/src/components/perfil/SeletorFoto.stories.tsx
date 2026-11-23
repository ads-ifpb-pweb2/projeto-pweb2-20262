import type { Meta, StoryObj } from '@storybook/react-vite'
import { SeletorFoto } from './SeletorFoto'

const meta = {
  title: 'Perfil/SeletorFoto',
  component: SeletorFoto,
  args: { nome: 'Maria da Silva', arquivo: null, onEscolher: () => {}, onRemover: () => {} },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SeletorFoto>
export default meta
type Story = StoryObj<typeof meta>

export const SemFoto: Story = {}
export const ComErro: Story = { args: { erro: 'A foto pode ter no máximo 5 MB.' } }
export const Desabilitado: Story = { args: { desabilitado: true } }

import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'

// Padrão para todos os componentes de UI: um arquivo .stories.tsx ao lado do componente.
const meta = {
  title: 'UI/Button',
  component: Button,
  args: { children: 'Entrar' },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primario: Story = {}
export const Secundario: Story = { args: { variante: 'secundario' } }
export const Perigo: Story = { args: { variante: 'perigo', children: 'Remover' } }
export const Carregando: Story = { args: { carregando: true } }
export const Desabilitado: Story = { args: { disabled: true } }

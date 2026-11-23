import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input } from './Input'

const meta = {
  title: 'UI/Input',
  component: Input,
  args: { rotulo: 'E-mail', placeholder: 'voce@academico.ifpb.edu.br' },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Padrao: Story = {}
export const Opcional: Story = { args: { rotulo: 'Telefone', opcional: true } }
export const ComErro: Story = { args: { erro: 'Use o e-mail institucional (@academico.ifpb.edu.br).' } }

import type { Meta, StoryObj } from '@storybook/react-vite'
import { Select } from './Select'

const meta = {
  title: 'UI/Select',
  component: Select,
  args: {
    rotulo: 'Curso',
    placeholder: 'Selecione um curso',
    opcoes: [
      { valor: 1, rotulo: 'Análise e Desenvolvimento de Sistemas' },
      { valor: 2, rotulo: 'Engenharia Civil' },
    ],
  },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Padrao: Story = {}
export const ComErro: Story = { args: { erro: 'Obrigatório.' } }

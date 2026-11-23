import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Paginacao } from './Paginacao'

const meta = {
  title: 'UI/Paginacao',
  component: Paginacao,
  args: { pagina: 1, totalPaginas: 5, onPagina: () => {} },
} satisfies Meta<typeof Paginacao>
export default meta
type Story = StoryObj<typeof meta>

export const Interativa: Story = {
  render: (args) => {
    const [pagina, setPagina] = useState(2)
    const [tamanho, setTamanho] = useState(10)
    return <Paginacao {...args} pagina={pagina} onPagina={setPagina} tamanho={tamanho} onTamanho={setTamanho} />
  },
}
export const PrimeiraPagina: Story = { args: { pagina: 1 } }
export const UltimaPagina: Story = { args: { pagina: 5 } }
export const Desabilitada: Story = { args: { pagina: 2, desabilitado: true } }

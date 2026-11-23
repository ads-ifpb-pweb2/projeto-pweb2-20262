import type { Meta, StoryObj } from '@storybook/react-vite'
import { PerfilCabecalho } from './PerfilCabecalho'
import { Button } from '../ui/Button'

const perfil = {
  id: 1,
  nome: 'Maria da Silva',
  curso: { id: 1, nome: 'Análise e Desenvolvimento de Sistemas' },
  telefone: '(83) 99999-0000',
  fotoUrl: null,
}

const meta = { title: 'Perfil/PerfilCabecalho', component: PerfilCabecalho, args: { perfil }, parameters: { layout: 'padded' } } satisfies Meta<typeof PerfilCabecalho>
export default meta
type Story = StoryObj<typeof meta>

export const Completo: Story = {}
export const SemContato: Story = { args: { perfil: { ...perfil, telefone: null } } }
export const ComAcoes: Story = { args: { acoes: <Button variante="secundario">Editar perfil</Button> } }

import type { Meta, StoryObj } from '@storybook/react-vite'
import { SeloEstado } from './SeloEstado'

const meta = { title: 'UI/SeloEstado', component: SeloEstado, args: { estado: 'ativo' } } satisfies Meta<typeof SeloEstado>
export default meta
type Story = StoryObj<typeof meta>

export const Ativo: Story = {}
export const Pausado: Story = { args: { estado: 'pausado' } }
export const Reservado: Story = { args: { estado: 'reservado' } }
export const Vendido: Story = { args: { estado: 'vendido' } }
export const Concluido: Story = { args: { estado: 'concluido' } }

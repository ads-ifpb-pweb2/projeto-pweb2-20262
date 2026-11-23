import type { Meta, StoryObj } from '@storybook/react-vite'
import { Alert } from './Alert'

const meta = { title: 'UI/Alert', component: Alert } satisfies Meta<typeof Alert>
export default meta
type Story = StoryObj<typeof meta>

export const Erro: Story = { args: { tipo: 'erro', children: 'E-mail ou senha incorretos.' } }
export const Info: Story = { args: { tipo: 'info', children: 'Anúncio publicado com sucesso.' } }

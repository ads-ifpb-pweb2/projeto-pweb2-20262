import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { ButtonLink } from './ButtonLink'

const meta = {
  title: 'UI/ButtonLink',
  component: ButtonLink,
  args: { to: '/perfil/editar', children: 'Editar perfil' },
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
} satisfies Meta<typeof ButtonLink>
export default meta
type Story = StoryObj<typeof meta>

export const Primario: Story = {}
export const Secundario: Story = { args: { variante: 'secundario' } }

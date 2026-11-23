import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar } from './Avatar'

const foto =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#8ab6a0"/><circle cx="100" cy="80" r="40" fill="#fff"/><rect x="40" y="130" width="120" height="70" rx="35" fill="#fff"/></svg>',
  )

const meta = { title: 'UI/Avatar', component: Avatar, args: { nome: 'Maria da Silva' } } satisfies Meta<typeof Avatar>
export default meta
type Story = StoryObj<typeof meta>

export const SemFoto: Story = {}
export const ComFoto: Story = { args: { fotoUrl: foto } }
export const FotoQuebrada: Story = { args: { fotoUrl: 'http://localhost:1/nao-existe.jpg' } }
export const Pequeno: Story = { args: { tamanho: 'sm' } }
export const Grande: Story = { args: { tamanho: 'lg', fotoUrl: foto } }

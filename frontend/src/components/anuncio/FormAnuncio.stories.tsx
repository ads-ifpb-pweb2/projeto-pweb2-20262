import type { Meta, StoryObj } from '@storybook/react'
import { FormAnuncio } from './FormAnuncio'

const meta: Meta<typeof FormAnuncio> = {
  title: 'Anuncio/FormAnuncio',
  component: FormAnuncio,
}

export default meta
type Story = StoryObj<typeof FormAnuncio>

export const NovoAnuncio: Story = {
  args: {
    enviando: false,
    onSubmit: () => {},
    onCancelar: () => {},
  },
}

export const Enviando: Story = {
  args: {
    enviando: true,
    onSubmit: () => {},
    onCancelar: () => {},
  },
}
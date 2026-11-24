import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import type { FotoAnuncio } from '../../api/types'
import { SeletorMultiplasFotos } from './SeletorMultiplasFotos'

const meta: Meta<typeof SeletorMultiplasFotos> = {
  title: 'Anuncio/SeletorMultiplasFotos',
  component: SeletorMultiplasFotos,
}

export default meta
type Story = StoryObj<typeof SeletorMultiplasFotos>

export const Vazio: Story = {
  render: () => {
    const [estado, setEstado] = useState<{
      fotosExistentes: FotoAnuncio[]
      novasFotos: File[]
      capaId?: number
      capaIndice?: number
    }>({
      fotosExistentes: [],
      novasFotos: [],
    })

    return (
      <div style={{ maxWidth: 640 }}>
        <SeletorMultiplasFotos
          fotosExistentes={estado.fotosExistentes}
          novasFotos={estado.novasFotos}
          capaId={estado.capaId}
          capaIndice={estado.capaIndice}
          onChange={setEstado}
        />
      </div>
    )
  },
}

export const ComErroValidacao: Story = {
  args: {
    fotosExistentes: [],
    novasFotos: [],
    erro: 'Adicione pelo menos 1 foto do item.',
    onChange: () => {},
  },
}
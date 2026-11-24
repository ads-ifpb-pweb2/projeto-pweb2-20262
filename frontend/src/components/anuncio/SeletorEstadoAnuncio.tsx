import type { EstadoAnuncio, Modalidade } from '../../api/types'
import { ROTULO_ESTADO } from '../ui/SeloEstado'
import { ESTADOS_POR_MODALIDADE } from './rotulos'
import styles from './SeletorEstadoAnuncio.module.css'

export interface SeletorEstadoAnuncioProps {
  estadoAtual: EstadoAnuncio
  modalidade: Modalidade
  carregando?: boolean
  onAlterar: (novoEstado: EstadoAnuncio) => void
}

export function SeletorEstadoAnuncio({
  estadoAtual,
  modalidade,
  carregando,
  onAlterar,
}: SeletorEstadoAnuncioProps) {
  const opcoes = ESTADOS_POR_MODALIDADE[modalidade]

  return (
    <div className={styles.container}>
      <span className={styles.rotulo}>Alterar estado do anúncio</span>
      <div className={styles.opcoes} role="group" aria-label="Estado do anúncio">
        {opcoes.map((estado) => {
          const ativo = estado === estadoAtual
          return (
            <button
              key={estado}
              type="button"
              className={`${styles.opcao} ${ativo ? styles.atual : ''}`}
              disabled={carregando || ativo}
              aria-pressed={ativo}
              onClick={() => onAlterar(estado)}
            >
              {ROTULO_ESTADO[estado]}
            </button>
          )
        })}
      </div>
    </div>
  )
}

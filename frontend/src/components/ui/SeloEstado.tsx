import type { EstadoAnuncio } from '../../api/types'
import styles from './SeloEstado.module.css'

export const ROTULO_ESTADO: Record<EstadoAnuncio, string> = {
  ativo: 'Ativo',
  pausado: 'Pausado',
  reservado: 'Reservado',
  vendido: 'Vendido',
  concluido: 'Concluído',
}

export function SeloEstado({ estado }: { estado: EstadoAnuncio }) {
  return <span className={`${styles.selo} ${styles[estado]}`}>{ROTULO_ESTADO[estado]}</span>
}

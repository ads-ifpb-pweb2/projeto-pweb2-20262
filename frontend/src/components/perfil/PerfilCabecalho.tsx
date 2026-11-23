import type { ReactNode } from 'react'
import type { Perfil } from '../../api/types'
import { linkWhatsApp } from '../../utils/formatar'
import { Avatar } from '../ui/Avatar'
import styles from './PerfilCabecalho.module.css'

export interface PerfilCabecalhoProps {
  perfil: Perfil
  /** Botões à direita (ex.: "Editar perfil" em /perfil) */
  acoes?: ReactNode
}

/** RF02.1 — foto, nome, curso e contato */
export function PerfilCabecalho({ perfil, acoes }: PerfilCabecalhoProps) {
  return (
    <header className={styles.cabecalho}>
      <Avatar nome={perfil.nome} fotoUrl={perfil.fotoUrl} tamanho="lg" />
      <div className={styles.dados}>
        <h1>{perfil.nome}</h1>
        <span className={styles.curso}>{perfil.curso.nome}</span>
        {perfil.telefone ? (
          <span>
            {perfil.telefone} ·{' '}
            <a href={linkWhatsApp(perfil.telefone)} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          </span>
        ) : (
          <span className={styles.semContato}>Contato não informado</span>
        )}
      </div>
      {acoes}
    </header>
  )
}

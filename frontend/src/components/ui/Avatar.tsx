import { useState } from 'react'
import styles from './Avatar.module.css'

export interface AvatarProps {
  nome: string
  /** URL assinada da API (expira em 1h). Sem foto, ou se a URL falhar, mostra as iniciais. */
  fotoUrl?: string | null
  tamanho?: 'sm' | 'md' | 'lg'
}

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  const primeira = partes[0][0]
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ''
  return (primeira + ultima).toUpperCase()
}

export function Avatar({ nome, fotoUrl, tamanho = 'md' }: AvatarProps) {
  const [falhou, setFalhou] = useState(false)
  const mostrarFoto = !!fotoUrl && !falhou

  return (
    <span className={`${styles.avatar} ${styles[tamanho]}`} role="img" aria-label={`Foto de ${nome}`}>
      {mostrarFoto ? <img src={fotoUrl} alt="" onError={() => setFalhou(true)} /> : iniciais(nome)}
    </span>
  )
}

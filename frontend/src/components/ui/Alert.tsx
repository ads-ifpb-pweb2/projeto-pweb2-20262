import type { ReactNode } from 'react'
import styles from './Alert.module.css'

export function Alert({ tipo = 'erro', children }: { tipo?: 'erro' | 'info'; children: ReactNode }) {
  return <div className={`${styles.alerta} ${styles[tipo]}`} role={tipo === 'erro' ? 'alert' : 'status'}>{children}</div>
}

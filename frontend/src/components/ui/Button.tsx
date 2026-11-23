import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario' | 'perigo'
  cheio?: boolean
  carregando?: boolean
}

export function Button({ variante = 'primario', cheio, carregando, disabled, children, className, ...rest }: ButtonProps) {
  const classes = [styles.botao, styles[variante], cheio ? styles.cheio : '', className ?? ''].join(' ').trim()
  return (
    <button className={classes} disabled={disabled || carregando} {...rest}>
      {carregando ? 'Aguarde…' : children}
    </button>
  )
}

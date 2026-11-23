import { useId, type InputHTMLAttributes } from 'react'
import styles from './Field.module.css'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  rotulo: string
  erro?: string
  opcional?: boolean
}

export function Input({ rotulo, erro, opcional, className, ...rest }: InputProps) {
  const id = useId()
  return (
    <div className={styles.campo}>
      <label htmlFor={id} className={styles.rotulo}>
        {rotulo} {opcional && <span className={styles.opcional}>(opcional)</span>}
      </label>
      <input
        id={id}
        className={`${styles.controle} ${erro ? styles.invalido : ''} ${className ?? ''}`}
        aria-invalid={!!erro}
        {...rest}
      />
      {erro && <span className={styles.erro} role="alert">{erro}</span>}
    </div>
  )
}

import { useId, type SelectHTMLAttributes } from 'react'
import styles from './Field.module.css'

export interface SelectOption {
  valor: string | number
  rotulo: string
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  rotulo: string
  opcoes: SelectOption[]
  /** Texto da primeira opção vazia (ex.: "Selecione um curso") */
  placeholder?: string
  erro?: string
}

export function Select({ rotulo, opcoes, placeholder, erro, className, ...rest }: SelectProps) {
  const id = useId()
  return (
    <div className={styles.campo}>
      <label htmlFor={id} className={styles.rotulo}>{rotulo}</label>
      <select
        id={id}
        className={`${styles.controle} ${erro ? styles.invalido : ''} ${className ?? ''}`}
        aria-invalid={!!erro}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>{o.rotulo}</option>
        ))}
      </select>
      {erro && <span className={styles.erro} role="alert">{erro}</span>}
    </div>
  )
}

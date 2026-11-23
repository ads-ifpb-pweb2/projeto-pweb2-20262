import { Link, type LinkProps } from 'react-router-dom'
import styles from './Button.module.css'

export interface ButtonLinkProps extends Omit<LinkProps, 'className'> {
  variante?: 'primario' | 'secundario' | 'perigo'
  cheio?: boolean
  className?: string
}

/** <Link> com a aparência do <Button>. Use para navegar; use <Button> para ações. */
export function ButtonLink({ variante = 'primario', cheio, className, ...rest }: ButtonLinkProps) {
  const classes = [styles.botao, styles[variante], cheio ? styles.cheio : '', className ?? ''].join(' ').trim()
  return <Link className={classes} {...rest} />
}

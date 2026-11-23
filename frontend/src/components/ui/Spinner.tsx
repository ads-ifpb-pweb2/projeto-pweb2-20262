import styles from './Spinner.module.css'

export function Spinner({ tela }: { tela?: boolean }) {
  const spinner = <div className={styles.spinner} role="status" aria-label="Carregando" />
  return tela ? <div className={styles.tela}>{spinner}</div> : spinner
}

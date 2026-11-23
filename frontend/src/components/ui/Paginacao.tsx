import { TAMANHOS_PAGINA } from '../../api/types'
import { Button } from './Button'
import styles from './Paginacao.module.css'

export interface PaginacaoProps {
  /** Página atual, a partir de 1 */
  pagina: number
  totalPaginas: number
  onPagina: (pagina: number) => void
  /** Se informados, mostra o seletor de itens por página (5, 10, 25 ou 50) */
  tamanho?: number
  onTamanho?: (tamanho: number) => void
  desabilitado?: boolean
}

export function Paginacao({ pagina, totalPaginas, onPagina, tamanho, onTamanho, desabilitado }: PaginacaoProps) {
  const temSeletor = tamanho !== undefined && onTamanho !== undefined
  if (totalPaginas <= 1 && !temSeletor) return null

  return (
    <nav className={styles.paginacao} aria-label="Paginação">
      <div className={styles.nav}>
        <Button variante="secundario" disabled={desabilitado || pagina <= 1} onClick={() => onPagina(pagina - 1)}>
          Anterior
        </Button>
        <span className={styles.info}>Página {pagina} de {Math.max(totalPaginas, 1)}</span>
        <Button variante="secundario" disabled={desabilitado || pagina >= totalPaginas} onClick={() => onPagina(pagina + 1)}>
          Próxima
        </Button>
      </div>
      {temSeletor && (
        <label className={styles.tamanho}>
          Por página
          <select value={tamanho} disabled={desabilitado} onChange={(e) => onTamanho(Number(e.target.value))}>
            {TAMANHOS_PAGINA.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
      )}
    </nav>
  )
}

import { Link } from 'react-router-dom'
import type { AnuncioResumo } from '../../api/types'
import { formatarData, formatarPreco } from '../../utils/formatar'
import { SeloEstado } from '../ui/SeloEstado'
import styles from './AnuncioLinha.module.css'

/**
 * PROVISÓRIO: lista simples de anúncio para o perfil (RF02).
 * Quando o Card do Rafael estiver na main, troque por ele e apague este arquivo.
 */
export function AnuncioLinha({ anuncio }: { anuncio: AnuncioResumo }) {
  return (
    <Link to={`/anuncios/${anuncio.id}`} className={styles.linha}>
      <img className={styles.capa} src={anuncio.capaUrl} alt="" loading="lazy" />
      <div className={styles.corpo}>
        <span className={styles.titulo}>{anuncio.titulo}</span>
        <span className={styles.meta}>
          {anuncio.categoria.nome} · publicado em {formatarData(anuncio.publicadoEm)}
        </span>
        <SeloEstado estado={anuncio.estado} />
      </div>
      <span className={styles.preco}>{formatarPreco(anuncio.preco)}</span>
    </Link>
  )
}

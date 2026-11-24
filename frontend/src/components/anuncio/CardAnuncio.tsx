import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { AnuncioResumo } from '../../api/types'
import { formatarData, formatarPreco } from '../../utils/formatar'
import { SeloEstado } from '../ui/SeloEstado'
import { ROTULO_CONSERVACAO } from './rotulos'
import styles from './CardAnuncio.module.css'

export interface CardAnuncioProps {
  anuncio: AnuncioResumo
  /** Exibe o selo de estado do anúncio (útil no perfil do dono, onde há pausados/vendidos). */
  mostrarEstado?: boolean
}

export function CardAnuncio({ anuncio, mostrarEstado = true }: CardAnuncioProps) {
  const [falhouImagem, setFalhouImagem] = useState(false)
  const ehDoacao = anuncio.modalidade === 'doacao'

  return (
    <Link to={`/anuncios/${anuncio.id}`} className={styles.card}>
      <div className={styles.midia}>
        {anuncio.capaUrl && !falhouImagem ? (
          <img
            className={styles.capa}
            src={anuncio.capaUrl}
            alt={anuncio.titulo}
            loading="lazy"
            onError={() => setFalhouImagem(true)}
          />
        ) : (
          <div className={styles.semFoto} aria-hidden="true">
            Sem foto
          </div>
        )}
      </div>

      <div className={styles.corpo}>
        <div className={styles.topo}>
          <span className={styles.categoria}>{anuncio.categoria.nome}</span>
          {mostrarEstado && <SeloEstado estado={anuncio.estado} />}
        </div>

        <h3 className={styles.titulo}>{anuncio.titulo}</h3>

        <p className={`${styles.preco} ${ehDoacao ? styles.doacao : ''}`}>
          {formatarPreco(anuncio.preco)}
        </p>

        <div className={styles.rodape}>
          <span className={styles.conservacao}>{ROTULO_CONSERVACAO[anuncio.estadoConservacao]}</span>
          <span className={styles.meta}>
            {anuncio.anunciante.nome} · {formatarData(anuncio.publicadoEm)}
          </span>
        </div>
      </div>
    </Link>
  )
}

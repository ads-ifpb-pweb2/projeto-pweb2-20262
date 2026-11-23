import type { ReactNode } from 'react'
import type { AnuncioResumo, Pagina } from '../../api/types'
import { AnuncioLinha } from '../anuncio/AnuncioLinha'
import { Alert } from '../ui/Alert'
import { Paginacao } from '../ui/Paginacao'
import { Spinner } from '../ui/Spinner'
import styles from './ListaAnunciosUsuario.module.css'

export interface ListaAnunciosUsuarioProps {
  anuncios: Pagina<AnuncioResumo> | null
  carregando: boolean
  erro: string | null
  pagina: number
  tamanho: number
  onPagina: (pagina: number) => void
  onTamanho: (tamanho: number) => void
  textoVazio?: ReactNode
}

/** Lista paginada de anúncios de um usuário. Os props vêm direto do hook usePerfil. */
export function ListaAnunciosUsuario({
  anuncios, carregando, erro, pagina, tamanho, onPagina, onTamanho,
  textoVazio = 'Nenhum anúncio por aqui ainda.',
}: ListaAnunciosUsuarioProps) {
  if (erro) return <Alert>{erro}</Alert>
  if (!anuncios) {
    return carregando ? <div className={styles.centro}><Spinner /></div> : <p className={styles.vazio}>{textoVazio}</p>
  }
  if (anuncios.total === 0) return <p className={styles.vazio}>{textoVazio}</p>

  return (
    <>
      <div className={`${styles.lista} ${carregando ? styles.carregandoPagina : ''}`} aria-busy={carregando}>
        {anuncios.itens.map((a) => (
          <AnuncioLinha key={a.id} anuncio={a} />
        ))}
      </div>
      <Paginacao
        pagina={pagina}
        totalPaginas={anuncios.totalPaginas}
        onPagina={onPagina}
        tamanho={tamanho}
        onTamanho={onTamanho}
        desabilitado={carregando}
      />
    </>
  )
}

import { useEffect, useState } from 'react'
import type { FotoAnuncio } from '../../api/types'
import styles from './GaleriaFotos.module.css'

export interface GaleriaFotosProps {
  fotos: FotoAnuncio[]
  titulo: string
}

function indiceCapa(fotos: FotoAnuncio[]): number {
  const idx = fotos.findIndex((f) => f.capa)
  return idx >= 0 ? idx : 0
}

export function GaleriaFotos({ fotos, titulo }: GaleriaFotosProps) {
  const [indiceAtual, setIndiceAtual] = useState(() => indiceCapa(fotos))
  const [falhouIds, setFalhouIds] = useState<Record<number, boolean>>({})

  useEffect(() => {
    setIndiceAtual(indiceCapa(fotos))
    setFalhouIds({})
  }, [fotos])

  if (fotos.length === 0) {
    return (
      <div className={styles.galeria}>
        <div className={styles.principal}>
          <span className={styles.semFoto}>Sem fotos disponíveis</span>
        </div>
      </div>
    )
  }

  const indiceSeguro = indiceAtual < fotos.length ? indiceAtual : 0
  const fotoAtual = fotos[indiceSeguro]
  const temVarias = fotos.length > 1

  function anterior() {
    setIndiceAtual((atual) => (atual === 0 ? fotos.length - 1 : atual - 1))
  }

  function proxima() {
    setIndiceAtual((atual) => (atual === fotos.length - 1 ? 0 : atual + 1))
  }

  return (
    <div className={styles.galeria}>
      <div className={styles.principal}>
        {falhouIds[fotoAtual.id] ? (
          <span className={styles.semFoto}>Não foi possível carregar a imagem</span>
        ) : (
          <img
            className={styles.imagem}
            src={fotoAtual.url}
            alt={`${titulo} — foto ${indiceSeguro + 1} de ${fotos.length}`}
            onError={() => setFalhouIds((prev) => ({ ...prev, [fotoAtual.id]: true }))}
          />
        )}

        {temVarias && (
          <>
            <button
              type="button"
              className={`${styles.seta} ${styles.esquerda}`}
              onClick={anterior}
              aria-label="Foto anterior"
            >
              ‹
            </button>
            <button
              type="button"
              className={`${styles.seta} ${styles.direita}`}
              onClick={proxima}
              aria-label="Próxima foto"
            >
              ›
            </button>
            <span className={styles.contador} aria-live="polite">
              {indiceSeguro + 1} / {fotos.length}
            </span>
          </>
        )}
      </div>

      {temVarias && (
        <div className={styles.miniaturas} role="list" aria-label="Miniaturas das fotos">
          {fotos.map((foto, i) => (
            <button
              key={foto.id}
              type="button"
              className={`${styles.miniatura} ${i === indiceSeguro ? styles.ativa : ''}`}
              onClick={() => setIndiceAtual(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-pressed={i === indiceSeguro}
            >
              <img src={foto.url} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

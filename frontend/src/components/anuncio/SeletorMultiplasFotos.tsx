import { useEffect, useId, useMemo, useRef, useState, type ChangeEvent } from 'react'
import type { FotoAnuncio } from '../../api/types'
import { validarImagem } from '../../utils/imagens'
import styles from './SeletorMultiplasFotos.module.css'

export interface SeletorMultiplasFotosProps {
  /** Fotos já cadastradas no servidor (usado na edição) */
  fotosExistentes?: FotoAnuncio[]
  /** Novos arquivos selecionados pelo usuário */
  novasFotos: File[]
  /** ID da foto existente escolhida como capa */
  capaId?: number
  /** Índice (em `novasFotos`) da foto nova escolhida como capa */
  capaIndice?: number
  onChange: (dados: {
    fotosExistentes: FotoAnuncio[]
    novasFotos: File[]
    capaId?: number
    capaIndice?: number
  }) => void
  erro?: string
  maximo?: number
}

export function SeletorMultiplasFotos({
  fotosExistentes = [],
  novasFotos,
  capaId,
  capaIndice,
  onChange,
  erro,
  maximo = 10,
}: SeletorMultiplasFotosProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [erroLocal, setErroLocal] = useState<string | null>(null)

  const totalFotos = fotosExistentes.length + novasFotos.length

  // Gera URLs temporárias para preview dos arquivos File e revoga ao desmontar/alterar
  const previewsNovas = useMemo(
    () => novasFotos.map((arquivo) => URL.createObjectURL(arquivo)),
    [novasFotos],
  )

  useEffect(() => {
    return () => {
      previewsNovas.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previewsNovas])

  function handleSelecionarArquivos(e: ChangeEvent<HTMLInputElement>) {
    const selecionados = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (selecionados.length === 0) return

    setErroLocal(null)

    const vagasRestantes = maximo - totalFotos
    if (vagasRestantes <= 0) {
      setErroLocal(`Você já atingiu o limite máximo de ${maximo} fotos.`)
      return
    }

    const validos: File[] = []
    for (const arquivo of selecionados) {
      if (validos.length >= vagasRestantes) {
        setErroLocal(`Limite de ${maximo} fotos atingido. Apenas as primeiras foram adicionadas.`)
        break
      }
      const msgErro = validarImagem(arquivo)
      if (msgErro) {
        setErroLocal(`${arquivo.name}: ${msgErro}`)
        continue
      }
      validos.push(arquivo)
    }

    if (validos.length === 0) return

    const proximasNovas = [...novasFotos, ...validos]
    const temCapaDefinida = capaId !== undefined || capaIndice !== undefined

    onChange({
      fotosExistentes,
      novasFotos: proximasNovas,
      capaId: temCapaDefinida ? capaId : undefined,
      capaIndice: temCapaDefinida ? capaIndice : 0,
    })
  }

  function handleDefinirCapaExistente(id: number) {
    onChange({
      fotosExistentes,
      novasFotos,
      capaId: id,
      capaIndice: undefined,
    })
  }

  function handleDefinirCapaNova(indice: number) {
    onChange({
      fotosExistentes,
      novasFotos,
      capaId: undefined,
      capaIndice: indice,
    })
  }

  function handleRemoverExistente(id: number) {
    const restantes = fotosExistentes.filter((f) => f.id !== id)
    let proximoCapaId = capaId
    let proximoCapaIndice = capaIndice

    if (capaId === id) {
      proximoCapaId = restantes[0]?.id
      proximoCapaIndice = restantes.length === 0 && novasFotos.length > 0 ? 0 : undefined
    }

    onChange({
      fotosExistentes: restantes,
      novasFotos,
      capaId: proximoCapaId,
      capaIndice: proximoCapaIndice,
    })
  }

  function handleRemoverNova(indiceRemover: number) {
    const restantes = novasFotos.filter((_, idx) => idx !== indiceRemover)
    let proximoCapaId = capaId
    let proximoCapaIndice = capaIndice

    if (capaIndice !== undefined) {
      if (capaIndice === indiceRemover) {
        if (fotosExistentes.length > 0) {
          proximoCapaId = fotosExistentes[0].id
          proximoCapaIndice = undefined
        } else {
          proximoCapaIndice = restantes.length > 0 ? 0 : undefined
        }
      } else if (capaIndice > indiceRemover) {
        proximoCapaIndice = capaIndice - 1
      }
    }

    onChange({
      fotosExistentes,
      novasFotos: restantes,
      capaId: proximoCapaId,
      capaIndice: proximoCapaIndice,
    })
  }

  const mensagemErro = erro || erroLocal

  return (
    <div className={styles.wrapper}>
      <div className={styles.cabecalho}>
        <label htmlFor={inputId} className={styles.rotulo}>
          Fotos do anúncio
        </label>
        <span className={styles.contador}>
          {totalFotos} de {maximo} fotos
        </span>
      </div>

      <p className={styles.dica}>
        Envie de 1 a {maximo} imagens (JPEG, PNG ou WebP, até 5 MB cada). Escolha qual será a foto de capa.
      </p>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className={styles.inputOculto}
        onChange={handleSelecionarArquivos}
      />

      <div className={styles.grade}>
        {fotosExistentes.map((foto) => {
          const ehCapa = capaId === foto.id
          return (
            <div key={`existente-${foto.id}`} className={`${styles.item} ${ehCapa ? styles.itemCapa : ''}`}>
              {ehCapa && <span className={styles.badgeCapa}>Capa</span>}
              <img src={foto.url} alt="Foto atual do anúncio" className={styles.imagem} />
              <div className={styles.acoes}>
                {!ehCapa && (
                  <button
                    type="button"
                    className={styles.btnAcao}
                    onClick={() => handleDefinirCapaExistente(foto.id)}
                  >
                    Definir capa
                  </button>
                )}
                <button
                  type="button"
                  className={`${styles.btnAcao} ${styles.btnRemover}`}
                  onClick={() => handleRemoverExistente(foto.id)}
                >
                  Remover
                </button>
              </div>
            </div>
          )
        })}

        {novasFotos.map((arquivo, indice) => {
          const ehCapa = capaId === undefined && capaIndice === indice
          return (
            <div key={`nova-${arquivo.name}-${indice}`} className={`${styles.item} ${ehCapa ? styles.itemCapa : ''}`}>
              {ehCapa && <span className={styles.badgeCapa}>Capa</span>}
              <img src={previewsNovas[indice]} alt={arquivo.name} className={styles.imagem} />
              <div className={styles.acoes}>
                {!ehCapa && (
                  <button
                    type="button"
                    className={styles.btnAcao}
                    onClick={() => handleDefinirCapaNova(indice)}
                  >
                    Definir capa
                  </button>
                )}
                <button
                  type="button"
                  className={`${styles.btnAcao} ${styles.btnRemover}`}
                  onClick={() => handleRemoverNova(indice)}
                >
                  Remover
                </button>
              </div>
            </div>
          )
        })}

        {totalFotos < maximo && (
          <button
            type="button"
            className={styles.areaAdicionar}
            onClick={() => inputRef.current?.click()}
          >
            + Adicionar fotos
          </button>
        )}
      </div>

      {mensagemErro && (
        <span className={styles.erro} role="alert">
          {mensagemErro}
        </span>
      )}
    </div>
  )
}
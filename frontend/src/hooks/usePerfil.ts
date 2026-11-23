import { useEffect, useState } from 'react'
import { ApiError } from '../api/client'
import { buscarPerfil, listarAnunciosDoUsuario } from '../api/usuarios'
import { TAMANHOS_PAGINA, type AnuncioResumo, type Pagina, type Perfil } from '../api/types'

export interface UsePerfilResultado {
  perfil: Perfil | null
  anuncios: Pagina<AnuncioResumo> | null
  pagina: number
  tamanho: number
  carregandoPerfil: boolean
  carregandoAnuncios: boolean
  erroPerfil: string | null
  erroAnuncios: string | null
  naoEncontrado: boolean
  setPagina: (pagina: number) => void
  mudarTamanho: (tamanho: number) => void
}

/**
 * RF02 — dados de um perfil + anúncios paginados, em estado LOCAL (sem Redux).
 *
 * IMPORTANTE: o componente que usa este hook deve receber `key={id}` do pai.
 * Assim, ao trocar de usuário, o hook reinicia do zero (página 1, sem dados do
 * usuário anterior piscando na tela e sem requisição extra).
 */
export function usePerfil(id: number | null | undefined, tamanhoInicial = 10): UsePerfilResultado {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [anuncios, setAnuncios] = useState<Pagina<AnuncioResumo> | null>(null)
  const [pagina, setPagina] = useState(1)
  const [tamanho, setTamanho] = useState(tamanhoInicial)

  const [carregandoPerfil, setCarregandoPerfil] = useState(true)
  const [carregandoAnuncios, setCarregandoAnuncios] = useState(true)
  const [erroPerfil, setErroPerfil] = useState<string | null>(null)
  const [erroAnuncios, setErroAnuncios] = useState<string | null>(null)
  const [naoEncontrado, setNaoEncontrado] = useState(false)

  const idInvalido = id == null || !Number.isInteger(id) || id <= 0

  // 1) Dados do perfil (não recarrega ao paginar)
  useEffect(() => {
    if (idInvalido) {
      setPerfil(null)
      setNaoEncontrado(id != null) // /usuarios/abc => não encontrado; id ausente => nada a mostrar
      setCarregandoPerfil(false)
      return
    }

    let cancelado = false
    setCarregandoPerfil(true)
    setErroPerfil(null)
    setNaoEncontrado(false)

    buscarPerfil(id)
      .then((dados) => {
        if (!cancelado) setPerfil(dados)
      })
      .catch((e: unknown) => {
        if (cancelado) return
        if (e instanceof ApiError && e.status === 404) {
          setNaoEncontrado(true)
          setPerfil(null)
        } else {
          setErroPerfil(e instanceof Error ? e.message : 'Erro ao carregar o perfil.')
        }
      })
      .finally(() => {
        if (!cancelado) setCarregandoPerfil(false)
      })

    return () => {
      cancelado = true
    }
  }, [id, idInvalido])

  // 2) Anúncios paginados (só esta lista recarrega ao mudar página ou tamanho)
  useEffect(() => {
    if (idInvalido) {
      setAnuncios(null)
      setCarregandoAnuncios(false)
      return
    }

    let cancelado = false
    setCarregandoAnuncios(true)
    setErroAnuncios(null)

    listarAnunciosDoUsuario(id, pagina, tamanho)
      .then((dados) => {
        if (!cancelado) setAnuncios(dados)
      })
      .catch((e: unknown) => {
        if (cancelado) return
        if (e instanceof ApiError && e.status === 404) {
          setAnuncios(null)
        } else {
          setErroAnuncios(e instanceof Error ? e.message : 'Erro ao carregar os anúncios.')
        }
      })
      .finally(() => {
        if (!cancelado) setCarregandoAnuncios(false)
      })

    return () => {
      cancelado = true
    }
  }, [id, idInvalido, pagina, tamanho])

  function irParaPagina(novaPagina: number) {
    setPagina(Math.max(1, novaPagina)) // a API rejeita página < 1
  }

  function mudarTamanho(novoTamanho: number) {
    // A API só aceita 5, 10, 25 ou 50 (senão responde 400)
    if (!(TAMANHOS_PAGINA as readonly number[]).includes(novoTamanho)) return
    setTamanho(novoTamanho)
    setPagina(1)
  }

  return {
    perfil,
    anuncios,
    pagina,
    tamanho,
    carregandoPerfil,
    carregandoAnuncios,
    erroPerfil,
    erroAnuncios,
    naoEncontrado,
    setPagina: irParaPagina,
    mudarTamanho,
  }
}

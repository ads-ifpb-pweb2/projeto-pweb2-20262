import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { buscarAnuncios } from '../../api/anuncios'
import { listarCategorias } from '../../api/catalogo'
import { ApiError } from '../../api/client'
import {
  TAMANHOS_PAGINA,
  type AnuncioResumo,
  type Categoria,
  type Direcao,
  type FiltrosBusca,
  type Modalidade,
  type Ordem,
  type Pagina,
} from '../../api/types'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { ButtonLink } from '../ui/ButtonLink'
import { Paginacao } from '../ui/Paginacao'
import { Spinner } from '../ui/Spinner'
import { CardAnuncio } from './CardAnuncio'
import { FiltrosAnuncio, type ValoresFiltros } from './FiltrosAnuncio'
import styles from './TelaBusca.module.css'

const TAMANHO_PADRAO = 10

function lerPagina(valor: string | null): number {
  const n = Number(valor)
  return Number.isInteger(n) && n >= 1 ? n : 1
}

function lerTamanho(valor: string | null): number {
  const n = Number(valor)
  return (TAMANHOS_PAGINA as readonly number[]).includes(n) ? n : TAMANHO_PADRAO
}

function lerOrdem(valor: string | null, modalidade: Modalidade): Ordem {
  if (modalidade === 'venda' && valor === 'preco') return 'preco'
  return 'data'
}

function lerDirecao(valor: string | null, ordem: Ordem): Direcao {
  if (valor === 'asc' || valor === 'desc') return valor
  return ordem === 'preco' ? 'asc' : 'desc'
}

export function TelaBusca({ modalidade }: { modalidade: Modalidade }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [resultado, setResultado] = useState<Pagina<AnuncioResumo> | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [erroPreco, setErroPreco] = useState<string | null>(null)

  const ehVenda = modalidade === 'venda'
  const categoria = searchParams.get('categoria') ?? ''
  const precoMin = ehVenda ? (searchParams.get('precoMin') ?? '') : ''
  const precoMax = ehVenda ? (searchParams.get('precoMax') ?? '') : ''
  const ordem = lerOrdem(searchParams.get('ordem'), modalidade)
  const direcao = lerDirecao(searchParams.get('direcao'), ordem)
  const pagina = lerPagina(searchParams.get('pagina'))
  const tamanho = lerTamanho(searchParams.get('tamanho'))

  useEffect(() => {
    let cancelado = false
    listarCategorias()
      .then((lista) => {
        if (!cancelado) setCategorias(lista)
      })
      .catch(() => {
        // Se falhar ao carregar categorias, a listagem continua funcionando sem o filtro.
      })
    return () => {
      cancelado = true
    }
  }, [])

  useEffect(() => {
    let cancelado = false
    setCarregando(true)
    setErro(null)
    setErroPreco(null)

    const filtros: FiltrosBusca = {
      ordem,
      direcao,
      pagina,
      tamanho,
    }
    if (categoria) filtros.categoria = categoria
    if (ehVenda && precoMin) filtros.precoMin = precoMin
    if (ehVenda && precoMax) filtros.precoMax = precoMax

    buscarAnuncios(modalidade, filtros)
      .then((dados) => {
        if (!cancelado) setResultado(dados)
      })
      .catch((e: unknown) => {
        if (cancelado) return
        if (e instanceof ApiError) {
          const msgPreco = e.campos.precoMin ?? e.campos.precoMax ?? null
          if (msgPreco) setErroPreco(msgPreco)
          setErro(e.message)
        } else {
          setErro('Não foi possível carregar os anúncios. Tente novamente.')
        }
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })

    return () => {
      cancelado = true
    }
  }, [modalidade, ehVenda, categoria, precoMin, precoMax, ordem, direcao, pagina, tamanho])

  function atualizarUrl(proximos: {
    categoria: string
    precoMin: string
    precoMax: string
    ordem: Ordem
    direcao: Direcao
    pagina: number
    tamanho: number
  }) {
    const params = new URLSearchParams()
    if (proximos.categoria) params.set('categoria', proximos.categoria)
    if (ehVenda && proximos.precoMin) params.set('precoMin', proximos.precoMin)
    if (ehVenda && proximos.precoMax) params.set('precoMax', proximos.precoMax)
    if (proximos.ordem !== 'data' || proximos.direcao !== 'desc') {
      params.set('ordem', proximos.ordem)
      params.set('direcao', proximos.direcao)
    }
    if (proximos.pagina > 1) params.set('pagina', String(proximos.pagina))
    if (proximos.tamanho !== TAMANHO_PADRAO) params.set('tamanho', String(proximos.tamanho))
    setSearchParams(params)
  }

  function handleAplicarFiltros(novos: ValoresFiltros) {
    atualizarUrl({
      ...novos,
      pagina: 1,
      tamanho,
    })
  }

  function handleLimparFiltros() {
    const params = new URLSearchParams()
    if (tamanho !== TAMANHO_PADRAO) params.set('tamanho', String(tamanho))
    setSearchParams(params)
  }

  function handlePagina(novaPagina: number) {
    atualizarUrl({ categoria, precoMin, precoMax, ordem, direcao, pagina: novaPagina, tamanho })
  }

  function handleTamanho(novoTamanho: number) {
    atualizarUrl({ categoria, precoMin, precoMax, ordem, direcao, pagina: 1, tamanho: novoTamanho })
  }

  const titulo = ehVenda ? 'Vendas' : 'Doações'
  const temFiltros = Boolean(categoria || precoMin || precoMax)

  return (
    <section>
      <header className={styles.cabecalho}>
        <div>
          <h1>{titulo}</h1>
          {resultado && !erro && (
            <p className={styles.contador}>
              {resultado.total === 0
                ? 'Nenhum anúncio encontrado'
                : resultado.total === 1
                  ? '1 anúncio encontrado'
                  : `${resultado.total} anúncios encontrados`}
            </p>
          )}
        </div>
        <ButtonLink to="/anuncios/novo">Novo anúncio</ButtonLink>
      </header>

      <FiltrosAnuncio
        modalidade={modalidade}
        categorias={categorias}
        categoria={categoria}
        precoMin={precoMin}
        precoMax={precoMax}
        ordem={ordem}
        direcao={direcao}
        erroPreco={erroPreco}
        desabilitado={carregando}
        onAplicar={handleAplicarFiltros}
        onLimpar={handleLimparFiltros}
      />

      {erro && <Alert>{erro}</Alert>}

      {!erro && !resultado && carregando && (
        <div className={styles.centro}>
          <Spinner />
        </div>
      )}

      {!erro && resultado && resultado.itens.length === 0 && !carregando && (
        <div className={styles.vazio}>
          <p>
            {temFiltros
              ? 'Nenhum anúncio corresponde aos filtros selecionados.'
              : `Ainda não há itens em ${titulo.toLowerCase()} no momento.`}
          </p>
          {temFiltros && (
            <Button variante="secundario" onClick={handleLimparFiltros}>
              Limpar filtros
            </Button>
          )}
        </div>
      )}

      {!erro && resultado && resultado.itens.length > 0 && (
        <>
          <div
            className={`${styles.grade} ${carregando ? styles.atualizando : ''}`}
            aria-busy={carregando}
          >
            {resultado.itens.map((anuncio) => (
              <CardAnuncio key={anuncio.id} anuncio={anuncio} mostrarEstado={false} />
            ))}
          </div>

          <Paginacao
            pagina={pagina}
            totalPaginas={resultado.totalPaginas}
            onPagina={handlePagina}
            tamanho={tamanho}
            onTamanho={handleTamanho}
            desabilitado={carregando}
          />
        </>
      )}
    </section>
  )
}

import { useEffect, useState, type FormEvent } from 'react'
import type { Categoria, Direcao, Modalidade, Ordem } from '../../api/types'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select, type SelectOption } from '../ui/Select'
import styles from './FiltrosAnuncio.module.css'

export interface ValoresFiltros {
  categoria: string
  precoMin: string
  precoMax: string
  ordem: Ordem
  direcao: Direcao
}

export interface FiltrosAnuncioProps {
  modalidade: Modalidade
  categorias: Categoria[]
  categoria: string
  precoMin: string
  precoMax: string
  ordem: Ordem
  direcao: Direcao
  erroPreco?: string | null
  desabilitado?: boolean
  onAplicar: (filtros: ValoresFiltros) => void
  onLimpar: () => void
}

const OPCOES_ORDEM_VENDA: SelectOption[] = [
  { valor: 'data:desc', rotulo: 'Mais recentes' },
  { valor: 'data:asc', rotulo: 'Mais antigos' },
  { valor: 'preco:asc', rotulo: 'Menor preço' },
  { valor: 'preco:desc', rotulo: 'Maior preço' },
]

const OPCOES_ORDEM_DOACAO: SelectOption[] = [
  { valor: 'data:desc', rotulo: 'Mais recentes' },
  { valor: 'data:asc', rotulo: 'Mais antigos' },
]

export function FiltrosAnuncio({
  modalidade,
  categorias,
  categoria,
  precoMin,
  precoMax,
  ordem,
  direcao,
  erroPreco,
  desabilitado,
  onAplicar,
  onLimpar,
}: FiltrosAnuncioProps) {
  const [minLocal, setMinLocal] = useState(precoMin)
  const [maxLocal, setMaxLocal] = useState(precoMax)
  const [erroLocal, setErroLocal] = useState<string | null>(null)

  useEffect(() => {
    setMinLocal(precoMin)
    setMaxLocal(precoMax)
    setErroLocal(null)
  }, [precoMin, precoMax])

  const ehVenda = modalidade === 'venda'
  const opcoesCategoria: SelectOption[] = categorias.map((c) => ({ valor: c.slug, rotulo: c.nome }))
  const opcoesOrdem = ehVenda ? OPCOES_ORDEM_VENDA : OPCOES_ORDEM_DOACAO
  const ordenacaoAtual = `${ordem}:${direcao}`

  const temFiltroAtivo =
    categoria !== '' ||
    (ehVenda && (precoMin !== '' || precoMax !== '')) ||
    ordem !== 'data' ||
    direcao !== 'desc'

  function validarFaixaPreco(min: string, max: string): string | null {
    const minTrim = min.trim()
    const maxTrim = max.trim()
    const nMin = minTrim === '' ? null : Number(minTrim)
    const nMax = maxTrim === '' ? null : Number(maxTrim)

    if (nMin !== null && (Number.isNaN(nMin) || nMin < 0)) {
      return 'O preço mínimo não pode ser negativo.'
    }
    if (nMax !== null && (Number.isNaN(nMax) || nMax < 0)) {
      return 'O preço máximo não pode ser negativo.'
    }
    if (nMin !== null && nMax !== null && nMin > nMax) {
      return 'O preço mínimo não pode ser maior que o máximo.'
    }
    return null
  }

  function handleCategoriaChange(novaCategoria: string) {
    onAplicar({
      categoria: novaCategoria,
      precoMin: ehVenda ? precoMin : '',
      precoMax: ehVenda ? precoMax : '',
      ordem,
      direcao,
    })
  }

  function handleOrdemChange(valor: string) {
    const [novaOrdem, novaDirecao] = valor.split(':') as [Ordem, Direcao]
    onAplicar({
      categoria,
      precoMin: ehVenda ? precoMin : '',
      precoMax: ehVenda ? precoMax : '',
      ordem: novaOrdem,
      direcao: novaDirecao,
    })
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!ehVenda) return

    const erro = validarFaixaPreco(minLocal, maxLocal)
    setErroLocal(erro)
    if (erro) return

    onAplicar({
      categoria,
      precoMin: minLocal.trim(),
      precoMax: maxLocal.trim(),
      ordem,
      direcao,
    })
  }

  const mensagemErro = erroLocal ?? erroPreco ?? null

  return (
    <form className={styles.barra} onSubmit={handleSubmit} aria-label="Filtros e ordenação">
      <div className={styles.campos}>
        <Select
          rotulo="Categoria"
          placeholder="Todas as categorias"
          opcoes={opcoesCategoria}
          value={categoria}
          disabled={desabilitado}
          onChange={(e) => handleCategoriaChange(e.target.value)}
        />

        {ehVenda && (
          <>
            <Input
              rotulo="Preço mín. (R$)"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="0,00"
              value={minLocal}
              disabled={desabilitado}
              onChange={(e) => {
                setMinLocal(e.target.value)
                if (erroLocal) setErroLocal(null)
              }}
            />
            <Input
              rotulo="Preço máx. (R$)"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="Sem limite"
              value={maxLocal}
              disabled={desabilitado}
              onChange={(e) => {
                setMaxLocal(e.target.value)
                if (erroLocal) setErroLocal(null)
              }}
            />
          </>
        )}

        <Select
          rotulo="Ordenar por"
          opcoes={opcoesOrdem}
          value={ordenacaoAtual}
          disabled={desabilitado}
          onChange={(e) => handleOrdemChange(e.target.value)}
        />

        <div className={styles.acoes}>
          {ehVenda && (
            <Button type="submit" disabled={desabilitado}>
              Filtrar
            </Button>
          )}
          {temFiltroAtivo && (
            <Button type="button" variante="secundario" disabled={desabilitado} onClick={onLimpar}>
              Limpar
            </Button>
          )}
        </div>
      </div>

      {mensagemErro && (
        <p className={styles.erro} role="alert">
          {mensagemErro}
        </p>
      )}
    </form>
  )
}

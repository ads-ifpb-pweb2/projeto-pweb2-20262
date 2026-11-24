import { useEffect, useState, type FormEvent } from 'react'
import { listarCategorias, listarEstadosConservacao } from '../../api/catalogo'
import type {
  AnuncioDetalhe,
  Categoria,
  DadosAnuncioForm,
  EstadoConservacao,
  FotoAnuncio,
  Modalidade,
  OpcaoEstadoConservacao,
} from '../../api/types'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { SeletorMultiplasFotos } from './SeletorMultiplasFotos'
import styles from './FormAnuncio.module.css'

export interface FormAnuncioProps {
  /** Preenchido no modo edição; ausente no modo criação */
  anuncioInicial?: AnuncioDetalhe
  enviando: boolean
  erroApi?: string | null
  errosCamposApi?: Record<string, string>
  onSubmit: (dados: DadosAnuncioForm) => void
  onCancelar: () => void
  textoBotaoSalvar?: string
}

function normalizarPrecoParaApi(valorBruto: string): string | null {
  const limpo = valorBruto.trim().replace(/\s/g, '').replace(',', '.')
  if (!limpo) return null
  const numero = Number(limpo)
  if (Number.isNaN(numero) || numero <= 0) return null
  return numero.toFixed(2)
}

export function FormAnuncio({
  anuncioInicial,
  enviando,
  erroApi,
  errosCamposApi = {},
  onSubmit,
  onCancelar,
  textoBotaoSalvar = 'Publicar anúncio',
}: FormAnuncioProps) {
  const ehEdicao = Boolean(anuncioInicial)

  // Listas vindas da API (estado local)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [estadosConservacao, setEstadosConservacao] = useState<OpcaoEstadoConservacao[]>([])
  const [erroCatalogo, setErroCatalogo] = useState<string | null>(null)

  // Campos do formulário (estado local)
  const [titulo, setTitulo] = useState(anuncioInicial?.titulo ?? '')
  const [descricao, setDescricao] = useState(anuncioInicial?.descricao ?? '')
  const [modalidade, setModalidade] = useState<Modalidade>(anuncioInicial?.modalidade ?? 'venda')
  const [preco, setPreco] = useState(
    anuncioInicial?.preco !== null && anuncioInicial?.preco !== undefined
      ? anuncioInicial.preco.toFixed(2)
      : '',
  )
  const [estadoConservacao, setEstadoConservacao] = useState<EstadoConservacao | ''>(
    anuncioInicial?.estadoConservacao ?? '',
  )
  const [categoriaId, setCategoriaId] = useState<string>(
    anuncioInicial?.categoria ? String(anuncioInicial.categoria.id) : '',
  )
  const [localEntrega, setLocalEntrega] = useState(anuncioInicial?.localEntrega ?? '')

  // Gerenciamento das fotos (existentes na edição + novas)
  const [fotosExistentes, setFotosExistentes] = useState<FotoAnuncio[]>(
    anuncioInicial?.fotos ?? [],
  )
  const [novasFotos, setNovasFotos] = useState<File[]>([])
  const [capaId, setCapaId] = useState<number | undefined>(() => {
    if (!anuncioInicial) return undefined
    const capaAtual = anuncioInicial.fotos.find((f) => f.capa) ?? anuncioInicial.fotos[0]
    return capaAtual?.id
  })
  const [capaIndice, setCapaIndice] = useState<number | undefined>(undefined)

  const [errosLocais, setErrosLocais] = useState<Record<string, string>>({})

  useEffect(() => {
    let ativo = true
    Promise.all([listarCategorias(), listarEstadosConservacao()])
      .then(([cats, estados]) => {
        if (!ativo) return
        setCategorias(cats)
        setEstadosConservacao(estados)
      })
      .catch(() => {
        if (!ativo) return
        setErroCatalogo('Não foi possível carregar categorias e estados de conservação.')
      })

    return () => {
      ativo = false
    }
  }, [])

  function validar(): DadosAnuncioForm | null {
    const erros: Record<string, string> = {}

    if (!titulo.trim()) erros.titulo = 'Informe o título do anúncio.'
    if (!descricao.trim()) erros.descricao = 'Informe a descrição do item.'
    if (!categoriaId) erros.categoriaId = 'Selecione uma categoria.'
    if (!estadoConservacao) erros.estadoConservacao = 'Selecione o estado de conservação.'
    if (!localEntrega.trim()) erros.localEntrega = 'Informe o local de entrega (ex.: Bloco A, Cantina).'

    let precoFormatado: string | undefined
    if (modalidade === 'venda') {
      const convertido = normalizarPrecoParaApi(preco)
      if (!convertido) {
        erros.preco = 'Informe um preço válido maior que zero (ex.: 80.00).'
      } else {
        precoFormatado = convertido
      }
    }

    const totalFotos = fotosExistentes.length + novasFotos.length
    if (totalFotos < 1) {
      erros.fotos = 'Adicione pelo menos 1 foto do item.'
    } else if (totalFotos > 10) {
      erros.fotos = 'O anúncio pode ter no máximo 10 fotos.'
    }

    setErrosLocais(erros)
    if (Object.keys(erros).length > 0) return null

    const dados: DadosAnuncioForm = {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      modalidade,
      estadoConservacao: estadoConservacao as EstadoConservacao,
      categoriaId: Number(categoriaId),
      localEntrega: localEntrega.trim(),
      fotos: novasFotos,
    }

    if (modalidade === 'venda' && precoFormatado) {
      dados.preco = precoFormatado
    }

    if (ehEdicao) {
      dados.fotosMantidas = fotosExistentes.map((f) => f.id)
    }

    if (capaId !== undefined) {
      dados.capaId = capaId
    } else if (capaIndice !== undefined) {
      dados.capaIndice = capaIndice
    } else if (novasFotos.length > 0) {
      dados.capaIndice = 0
    } else if (fotosExistentes.length > 0) {
      dados.capaId = fotosExistentes[0].id
    }

    return dados
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const payload = validar()
    if (!payload) return
    onSubmit(payload)
  }

  const errosMesclados = { ...errosCamposApi, ...errosLocais }

  return (
    <div className={styles.card}>
      <form className="form" onSubmit={handleSubmit} noValidate>
        {erroCatalogo && <Alert tipo="erro">{erroCatalogo}</Alert>}
        {erroApi && <Alert tipo="erro">{erroApi}</Alert>}

        <Input
          rotulo="Título do anúncio"
          placeholder="Ex.: Calculadora Científica Casio fx-82MS"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          erro={errosMesclados.titulo}
          maxLength={120}
          required
        />

        <div className={styles.campoTextoLongo}>
          <label htmlFor="descricao-anuncio" className={styles.rotulo}>
            Descrição
          </label>
          <textarea
            id="descricao-anuncio"
            className={`${styles.textarea} ${errosMesclados.descricao ? styles.textareaInvalida : ''}`}
            placeholder="Descreva detalhes, tempo de uso, acessórios inclusos, etc."
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            aria-invalid={!!errosMesclados.descricao}
          />
          {errosMesclados.descricao && (
            <span className={styles.erroCampo} role="alert">
              {errosMesclados.descricao}
            </span>
          )}
        </div>

        <div className={styles.linhaDupla}>
          <Select
            rotulo="Modalidade"
            value={modalidade}
            onChange={(e) => {
              const novaModalidade = e.target.value as Modalidade
              setModalidade(novaModalidade)
              if (novaModalidade === 'doacao') setPreco('')
            }}
            opcoes={[
              { valor: 'venda', rotulo: 'Venda' },
              { valor: 'doacao', rotulo: 'Doação' },
            ]}
            erro={errosMesclados.modalidade}
          />

          {modalidade === 'venda' && (
            <Input
              rotulo="Preço (R$)"
              type="text"
              inputMode="decimal"
              placeholder="Ex.: 80.00"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              erro={errosMesclados.preco}
              required
            />
          )}
        </div>

        <div className={styles.linhaDupla}>
          <Select
            rotulo="Categoria"
            placeholder="Selecione uma categoria"
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            opcoes={categorias.map((c) => ({ valor: c.id, rotulo: c.nome }))}
            erro={errosMesclados.categoriaId}
          />

          <Select
            rotulo="Estado de conservação"
            placeholder="Selecione o estado"
            value={estadoConservacao}
            onChange={(e) => setEstadoConservacao(e.target.value as EstadoConservacao)}
            opcoes={estadosConservacao.map((ec) => ({ valor: ec.valor, rotulo: ec.rotulo }))}
            erro={errosMesclados.estadoConservacao}
          />
        </div>

        <Input
          rotulo="Local de entrega no campus"
          placeholder="Ex.: Biblioteca, Bloco de Informática, Cantina"
          value={localEntrega}
          onChange={(e) => setLocalEntrega(e.target.value)}
          erro={errosMesclados.localEntrega}
          required
        />

        <SeletorMultiplasFotos
          fotosExistentes={fotosExistentes}
          novasFotos={novasFotos}
          capaId={capaId}
          capaIndice={capaIndice}
          onChange={(atualizado) => {
            setFotosExistentes(atualizado.fotosExistentes)
            setNovasFotos(atualizado.novasFotos)
            setCapaId(atualizado.capaId)
            setCapaIndice(atualizado.capaIndice)
          }}
          erro={errosMesclados.fotos}
        />

        <div className={styles.rodapeBotoes}>
          <Button type="button" variante="secundario" onClick={onCancelar} disabled={enviando}>
            Cancelar
          </Button>
          <Button type="submit" variante="primario" carregando={enviando}>
            {textoBotaoSalvar}
          </Button>
        </div>
      </form>
    </div>
  )
}
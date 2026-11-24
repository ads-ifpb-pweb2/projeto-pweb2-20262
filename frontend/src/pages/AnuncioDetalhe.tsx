import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { EstadoAnuncio } from '../api/types'
import { GaleriaFotos } from '../components/anuncio/GaleriaFotos'
import { ROTULO_CONSERVACAO } from '../components/anuncio/rotulos'
import { SeletorEstadoAnuncio } from '../components/anuncio/SeletorEstadoAnuncio'
import { Alert } from '../components/ui/Alert'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { ButtonLink } from '../components/ui/ButtonLink'
import { SeloEstado } from '../components/ui/SeloEstado'
import { Spinner } from '../components/ui/Spinner'
import { alterarEstadoAnuncio, buscarAnuncio, limparAnuncio } from '../store/anunciosSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { formatarData, formatarPreco, linkWhatsApp } from '../utils/formatar'
import styles from './AnuncioDetalhe.module.css'

export function AnuncioDetalhePage() {
  const { id } = useParams()
  const anuncioId = Number(id)
  const idValido = Number.isInteger(anuncioId) && anuncioId > 0

  const dispatch = useAppDispatch()
  const { detalhe, status, erro } = useAppSelector((s) => s.anuncios)
  const usuarioLogado = useAppSelector((s) => s.auth.usuario)

  const [alterandoEstado, setAlterandoEstado] = useState(false)
  const [erroEstado, setErroEstado] = useState<string | null>(null)

  useEffect(() => {
    setErroEstado(null)
    if (!idValido) return
    dispatch(buscarAnuncio(anuncioId))
    return () => {
      dispatch(limparAnuncio())
    }
  }, [dispatch, anuncioId, idValido])

  if (!idValido) {
    return (
      <div className={styles.estadoPagina}>
        <Alert>Anúncio não encontrado.</Alert>
        <ButtonLink to="/vendas" variante="secundario">
          Voltar para vendas
        </ButtonLink>
      </div>
    )
  }

  const carregandoInicial = (status === 'idle' || status === 'loading') && (!detalhe || detalhe.id !== anuncioId)
  if (carregandoInicial) {
    return <Spinner tela />
  }

  if (!detalhe || detalhe.id !== anuncioId) {
    return (
      <div className={styles.estadoPagina}>
        <Alert>{erro?.status === 404 ? 'Anúncio não encontrado.' : (erro?.mensagem ?? 'Não foi possível carregar o anúncio.')}</Alert>
        <ButtonLink to="/vendas" variante="secundario">
          Voltar para vendas
        </ButtonLink>
      </div>
    )
  }

  const ehVenda = detalhe.modalidade === 'venda'
  const ehDono = usuarioLogado?.id === detalhe.anunciante.id
  const rotaVoltar = ehVenda ? '/vendas' : '/doacoes'

  async function handleAlterarEstado(novoEstado: EstadoAnuncio) {
    if (!detalhe || novoEstado === detalhe.estado) return
    setAlterandoEstado(true)
    setErroEstado(null)
    try {
      await dispatch(alterarEstadoAnuncio({ id: detalhe.id, estado: novoEstado })).unwrap()
    } catch (e: unknown) {
      const mensagem =
        typeof e === 'object' && e !== null && 'mensagem' in e && typeof e.mensagem === 'string'
          ? e.mensagem
          : 'Não foi possível alterar o estado do anúncio.'
      setErroEstado(mensagem)
    } finally {
      setAlterandoEstado(false)
    }
  }

  return (
    <article className={styles.pagina}>
      <nav className={styles.voltar}>
        <Link to={rotaVoltar}>← Voltar para {ehVenda ? 'Vendas' : 'Doações'}</Link>
      </nav>

      <div className={styles.principal}>
        <GaleriaFotos fotos={detalhe.fotos} titulo={detalhe.titulo} />

        <div className={styles.painel}>
          <div className={styles.selos}>
            <SeloEstado estado={detalhe.estado} />
            <span className={styles.etiqueta}>{ehVenda ? 'Venda' : 'Doação'}</span>
            <span className={styles.etiqueta}>{detalhe.categoria.nome}</span>
          </div>

          <h1 className={styles.titulo}>{detalhe.titulo}</h1>

          <p className={`${styles.preco} ${!ehVenda ? styles.doacao : ''}`}>
            {formatarPreco(detalhe.preco)}
          </p>

          <dl className={styles.ficha}>
            <div>
              <dt>Conservação</dt>
              <dd>{ROTULO_CONSERVACAO[detalhe.estadoConservacao]}</dd>
            </div>
            <div>
              <dt>Local de entrega</dt>
              <dd>{detalhe.localEntrega}</dd>
            </div>
            <div>
              <dt>Publicado em</dt>
              <dd>{formatarData(detalhe.publicadoEm)}</dd>
            </div>
          </dl>

          <div className={styles.acoesInteresse}>
            <Button disabled title="Disponível na Etapa 2">
              Tenho interesse
            </Button>
            <Button variante="secundario" disabled title="Disponível na Etapa 3">
              Negociar
            </Button>
          </div>

          {ehDono && (
            <section className={styles.caixaDono} aria-label="Gerenciar anúncio">
              <SeletorEstadoAnuncio
                estadoAtual={detalhe.estado}
                modalidade={detalhe.modalidade}
                carregando={alterandoEstado}
                onAlterar={handleAlterarEstado}
              />
              {erroEstado && <Alert>{erroEstado}</Alert>}
              <div className={styles.editar}>
                <ButtonLink to={`/anuncios/${detalhe.id}/editar`} variante="secundario">
                  Editar anúncio
                </ButtonLink>
              </div>
            </section>
          )}

          <section className={styles.anunciante} aria-label="Anunciante">
            <Link to={`/usuarios/${detalhe.anunciante.id}`} className={styles.anuncianteLink}>
              <Avatar
                nome={detalhe.anunciante.nome}
                fotoUrl={detalhe.anunciante.fotoUrl}
                tamanho="md"
              />
              <div className={styles.anuncianteDados}>
                <span className={styles.anuncianteNome}>{detalhe.anunciante.nome}</span>
                <span className={styles.anuncianteCurso}>{detalhe.anunciante.curso.nome}</span>
              </div>
            </Link>
            {detalhe.anunciante.telefone ? (
              <a
                className={styles.contato}
                href={linkWhatsApp(detalhe.anunciante.telefone)}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp: {detalhe.anunciante.telefone}
              </a>
            ) : (
              <span className={styles.semContato}>Telefone não informado</span>
            )}
          </section>
        </div>
      </div>

      <section className={styles.descricao}>
        <h2>Descrição</h2>
        <p>{detalhe.descricao}</p>
      </section>
    </article>
  )
}

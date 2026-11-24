import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import type { DadosAnuncioForm } from '../api/types'
import { FormAnuncio } from '../components/anuncio/FormAnuncio'
import { Alert } from '../components/ui/Alert'
import { Spinner } from '../components/ui/Spinner'
import { buscarAnuncio, editarAnuncio, limparAnuncio } from '../store/anunciosSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'

export function AnuncioEditar() {
  const { id } = useParams()
  const anuncioId = Number(id)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const usuarioLogado = useAppSelector((state) => state.auth.usuario)
  const { detalhe, status, erro } = useAppSelector((state) => state.anuncios)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!Number.isFinite(anuncioId) || anuncioId <= 0) return
    dispatch(buscarAnuncio(anuncioId))
    return () => {
      dispatch(limparAnuncio())
    }
  }, [dispatch, anuncioId])

  if (!Number.isFinite(anuncioId) || anuncioId <= 0) {
    return <Navigate to="/vendas" replace />
  }

  if (status === 'loading' && !salvando && (!detalhe || detalhe.id !== anuncioId)) {
    return <Spinner />
  }

  if (status === 'failed' && (!detalhe || detalhe.id !== anuncioId)) {
    return <Alert tipo="erro">{erro?.mensagem ?? 'Anúncio não encontrado.'}</Alert>
  }

  if (!detalhe || detalhe.id !== anuncioId) {
    return null
  }

  // Trava de segurança: apenas o dono pode editar o anúncio
  if (usuarioLogado && detalhe.anunciante.id !== usuarioLogado.id) {
    return <Navigate to={`/anuncios/${detalhe.id}`} replace />
  }

  async function handleEditar(dados: DadosAnuncioForm) {
    setSalvando(true)
    try {
      const atualizado = await dispatch(editarAnuncio({ id: detalhe!.id, dados })).unwrap()
      navigate(`/anuncios/${atualizado.id}`)
    } catch {
      // Erro já armazenado em state.anuncios.erro
    } finally {
      setSalvando(false)
    }
  }

  return (
    <section>
      <h1>Editar anúncio</h1>
      <FormAnuncio
        key={detalhe.id}
        anuncioInicial={detalhe}
        enviando={salvando}
        erroApi={erro?.mensagem}
        errosCamposApi={erro?.campos}
        onSubmit={handleEditar}
        onCancelar={() => navigate(`/anuncios/${detalhe.id}`)}
        textoBotaoSalvar="Salvar alterações"
      />
    </section>
  )
}
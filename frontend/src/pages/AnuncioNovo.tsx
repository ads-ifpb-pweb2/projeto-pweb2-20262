import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { DadosAnuncioForm } from '../api/types'
import { FormAnuncio } from '../components/anuncio/FormAnuncio'
import { criarAnuncio, limparAnuncio } from '../store/anunciosSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'

export function AnuncioNovo() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { status, erro } = useAppSelector((state) => state.anuncios)

  useEffect(() => {
    dispatch(limparAnuncio())
  }, [dispatch])

  async function handleCriar(dados: DadosAnuncioForm) {
    try {
      const criado = await dispatch(criarAnuncio(dados)).unwrap()
      navigate(`/anuncios/${criado.id}`)
    } catch {
      // Erro já armazenado em state.anuncios.erro
    }
  }

  return (
    <section>
      <h1>Novo anúncio</h1>
      <FormAnuncio
        enviando={status === 'loading'}
        erroApi={erro?.mensagem}
        errosCamposApi={erro?.campos}
        onSubmit={handleCriar}
        onCancelar={() => navigate(-1)}
        textoBotaoSalvar="Publicar anúncio"
      />
    </section>
  )
}
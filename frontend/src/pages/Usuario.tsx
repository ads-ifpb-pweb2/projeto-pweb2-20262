import { Link, Navigate, useParams } from 'react-router-dom'
import { usePerfil } from '../hooks/usePerfil'
import { useAppSelector } from '../store/hooks'
import { PerfilCabecalho } from '../components/perfil/PerfilCabecalho'
import { ListaAnunciosUsuario } from '../components/perfil/ListaAnunciosUsuario'
import { Alert } from '../components/ui/Alert'
import { Spinner } from '../components/ui/Spinner'

/** RF02.3 — /usuarios/:id: perfil de outro estudante (a API só devolve os anúncios ativos dele) */
export function Usuario() {
  const { id } = useParams()
  const meuId = useAppSelector((s) => s.auth.usuario?.id)

  // O próprio perfil mora em /perfil
  if (meuId !== undefined && Number(id) === meuId) return <Navigate to="/perfil" replace />

  // key={id}: ao trocar de usuário, o hook reinicia do zero (ver usePerfil)
  return <UsuarioConteudo key={id} id={Number(id)} />
}

function UsuarioConteudo({ id }: { id: number }) {
  const p = usePerfil(id)

  if (p.carregandoPerfil) return <Spinner tela />

  if (p.naoEncontrado) {
    return (
      <>
        <h1>Estudante não encontrado</h1>
        <p><Link to="/vendas">Voltar para o início</Link></p>
      </>
    )
  }

  if (p.erroPerfil || !p.perfil) {
    return <Alert>{p.erroPerfil ?? 'Não foi possível carregar o perfil.'}</Alert>
  }

  return (
    <>
      <PerfilCabecalho perfil={p.perfil} />
      <section style={{ marginTop: '2rem' }}>
        <h2>Anúncios ativos de {p.perfil.nome.split(' ')[0]}</h2>
        <ListaAnunciosUsuario
          anuncios={p.anuncios}
          carregando={p.carregandoAnuncios}
          erro={p.erroAnuncios}
          pagina={p.pagina}
          tamanho={p.tamanho}
          onPagina={p.setPagina}
          onTamanho={p.mudarTamanho}
          textoVazio="Este estudante não tem anúncios ativos no momento."
          mostrarEstado={false}
        />
      </section>
    </>
  )
}

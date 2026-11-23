import { Link } from 'react-router-dom'
import { usePerfil } from '../hooks/usePerfil'
import { useAppSelector } from '../store/hooks'
import { PerfilCabecalho } from '../components/perfil/PerfilCabecalho'
import { ListaAnunciosUsuario } from '../components/perfil/ListaAnunciosUsuario'
import { Alert } from '../components/ui/Alert'
import { ButtonLink } from '../components/ui/ButtonLink'
import { Spinner } from '../components/ui/Spinner'
import styles from './Perfil.module.css'

/**
 * RF02.1 — /perfil: o meu perfil. Os dados ficam em estado local (usePerfil), fora do Redux.
 * Aqui a API devolve TODOS os meus anúncios, em qualquer estado (o selo de cada um mostra qual é).
 * Ao voltar de /perfil/editar a página remonta e busca os dados de novo, já atualizados.
 */
export function Perfil() {
  const usuario = useAppSelector((s) => s.auth.usuario)
  if (!usuario) return null // não acontece: a rota é protegida
  return <PerfilConteudo id={usuario.id} />
}

function PerfilConteudo({ id }: { id: number }) {
  const p = usePerfil(id)

  if (p.carregandoPerfil) return <Spinner tela />
  if (p.erroPerfil || !p.perfil) return <Alert>{p.erroPerfil ?? 'Não foi possível carregar o seu perfil.'}</Alert>

  return (
    <>
      <PerfilCabecalho
        perfil={p.perfil}
        acoes={<ButtonLink to="/perfil/editar" variante="secundario">Editar perfil</ButtonLink>}
      />

      <div className={styles.titulo}>
        <h2>Meus anúncios</h2>
        <ButtonLink to="/anuncios/novo">Novo anúncio</ButtonLink>
      </div>
      <ListaAnunciosUsuario
        anuncios={p.anuncios}
        carregando={p.carregandoAnuncios}
        erro={p.erroAnuncios}
        pagina={p.pagina}
        tamanho={p.tamanho}
        onPagina={p.setPagina}
        onTamanho={p.mudarTamanho}
        textoVazio={
          <>
            Você ainda não publicou nenhum anúncio. <Link to="/anuncios/novo">Publicar o primeiro</Link>
          </>
        }
      />
    </>
  )
}

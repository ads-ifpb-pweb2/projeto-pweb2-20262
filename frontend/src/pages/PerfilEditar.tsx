import { useEffect, useState, type FormEvent } from 'react'
import { listarCursos } from '../api/catalogo'
import type { ErroSerializado } from '../api/client'
import type { Curso, UsuarioLogado } from '../api/types'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { atualizarDadosPerfil, atualizarFotoPerfil } from '../store/authSlice'
import { validarImagem } from '../utils/imagens'
import { SeletorFoto } from '../components/perfil/SeletorFoto'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { ButtonLink } from '../components/ui/ButtonLink'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import styles from './PerfilEditar.module.css'

const REGEX_TELEFONE = /^$|^[0-9()+\-\s]{8,20}$/ // mesma regra da API

/**
 * RF02.2 — /perfil/editar. Os valores dos formulários ficam em estado local; ao salvar, os thunks
 * atualizam o usuário logado em `auth` (é o que a navbar e o /perfil enxergam).
 */
export function PerfilEditar() {
  const usuario = useAppSelector((s) => s.auth.usuario)
  if (!usuario) return null // não acontece: a rota é protegida
  return (
    <div className={styles.pagina}>
      <h1>Editar perfil</h1>
      <SecaoFoto usuario={usuario} />
      <SecaoDados usuario={usuario} />
      <div className={styles.acoes}>
        <ButtonLink to="/perfil" variante="secundario">Voltar ao perfil</ButtonLink>
      </div>
    </div>
  )
}

function SecaoFoto({ usuario }: { usuario: UsuarioLogado }) {
  const dispatch = useAppDispatch()
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  function escolher(f: File) {
    setSucesso(false)
    const mensagem = validarImagem(f)
    setErro(mensagem)
    setArquivo(mensagem ? null : f)
  }

  async function enviar() {
    if (!arquivo) return
    setSalvando(true)
    setErro(null)
    setSucesso(false)
    try {
      await dispatch(atualizarFotoPerfil(arquivo)).unwrap()
      setArquivo(null)
      setSucesso(true)
    } catch (e) {
      const falha = e as ErroSerializado
      setErro(falha.campos?.foto ?? falha.mensagem) // ex.: 413 "Cada foto pode ter no máximo 5 MB."
    } finally {
      setSalvando(false)
    }
  }

  return (
    <section className={styles.cartao}>
      <h2>Foto de perfil</h2>
      {sucesso && <Alert tipo="info">Foto atualizada.</Alert>}
      <SeletorFoto
        nome={usuario.nome}
        fotoAtualUrl={usuario.fotoUrl}
        arquivo={arquivo}
        onEscolher={escolher}
        onRemover={() => { setArquivo(null); setErro(null) }}
        erro={erro}
        desabilitado={salvando}
      />
      <div className={styles.acoes}>
        <Button type="button" onClick={enviar} disabled={!arquivo} carregando={salvando}>Salvar foto</Button>
      </div>
    </section>
  )
}

function SecaoDados({ usuario }: { usuario: UsuarioLogado }) {
  const dispatch = useAppDispatch()
  const [cursos, setCursos] = useState<Curso[]>([])
  const [erroCursos, setErroCursos] = useState(false)
  const [form, setForm] = useState({
    nome: usuario.nome,
    cursoId: String(usuario.curso.id),
    telefone: usuario.telefone ?? '',
  })
  const [erros, setErros] = useState<Record<string, string>>({})
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    listarCursos().then(setCursos).catch(() => setErroCursos(true))
  }, [])

  const alterar = (campo: keyof typeof form) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [campo]: e.target.value }))
    setSucesso(false)
  }

  // Só habilita "Salvar" se algo mudou em relação ao usuário logado
  const alterado =
    form.nome.trim() !== usuario.nome ||
    form.cursoId !== String(usuario.curso.id) ||
    form.telefone.trim() !== (usuario.telefone ?? '')

  // Se a lista de cursos não carregar, o curso atual continua como única opção
  const opcoesCurso = cursos.length
    ? cursos.map((c) => ({ valor: c.id, rotulo: c.nome }))
    : [{ valor: usuario.curso.id, rotulo: usuario.curso.nome }]

  function validar() {
    const e: Record<string, string> = {}
    const nome = form.nome.trim()
    if (!nome) e.nome = 'Obrigatório.'
    else if (nome.length > 100) e.nome = 'No máximo 100 caracteres.'
    if (!form.cursoId) e.cursoId = 'Selecione um curso.'
    if (!REGEX_TELEFONE.test(form.telefone.trim())) {
      e.telefone = 'Use de 8 a 20 caracteres: números, espaços, parênteses, + e -.'
    }
    return e
  }

  async function salvar(ev: FormEvent) {
    ev.preventDefault()
    setSucesso(false)
    setErroGeral(null)
    const locais = validar()
    setErros(locais)
    if (Object.keys(locais).length) return

    setSalvando(true)
    try {
      const atualizado = await dispatch(
        atualizarDadosPerfil({
          nome: form.nome.trim(),
          cursoId: Number(form.cursoId),
          telefone: form.telefone.trim() || null, // vazio remove o telefone
        }),
      ).unwrap()
      setForm({ nome: atualizado.nome, cursoId: String(atualizado.curso.id), telefone: atualizado.telefone ?? '' })
      setSucesso(true)
    } catch (e) {
      const falha = e as ErroSerializado
      const porCampo = falha.campos ?? {}
      setErros(porCampo)
      if (!Object.keys(porCampo).length) setErroGeral(falha.mensagem)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <section className={styles.cartao}>
      <h2>Dados pessoais</h2>
      <form className="form" onSubmit={salvar} noValidate>
        {sucesso && <Alert tipo="info">Dados salvos.</Alert>}
        {erroGeral && <Alert>{erroGeral}</Alert>}
        {erroCursos && <Alert>Não foi possível carregar a lista de cursos. Verifique se a API está no ar.</Alert>}
        <Input rotulo="Nome" value={form.nome} onChange={alterar('nome')} erro={erros.nome} maxLength={100} />
        <Input rotulo="E-mail (não pode ser alterado)" type="email" value={usuario.email} readOnly disabled />
        <Select rotulo="Curso" value={form.cursoId} onChange={alterar('cursoId')} opcoes={opcoesCurso} erro={erros.cursoId} />
        <Input
          rotulo="Telefone/WhatsApp"
          opcional
          value={form.telefone}
          onChange={alterar('telefone')}
          erro={erros.telefone}
          placeholder="(83) 99999-0000"
        />
        <Button type="submit" disabled={!alterado} carregando={salvando}>Salvar dados</Button>
      </form>
    </section>
  )
}

import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { listarCursos } from '../api/catalogo'
import type { Curso } from '../api/types'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { cadastrar, limparErro } from '../store/authSlice'
import { DOMINIO_INSTITUCIONAL, emailInstitucional } from '../utils/formatar'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'

/** RF01 — /cadastro. A lista de cursos e os valores do formulário ficam em estado local (não no Redux). */
export function Cadastro() {
  const dispatch = useAppDispatch()
  const { status, erro } = useAppSelector((s) => s.auth)

  const [cursos, setCursos] = useState<Curso[]>([])
  const [erroCursos, setErroCursos] = useState(false)
  const [form, setForm] = useState({ nome: '', email: '', senha: '', cursoId: '', telefone: '' })
  const [errosLocais, setErrosLocais] = useState<Record<string, string>>({})

  useEffect(() => {
    dispatch(limparErro())
    listarCursos().then(setCursos).catch(() => setErroCursos(true))
  }, [dispatch])

  const alterar = (campo: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [campo]: e.target.value }))

  function enviar(e: FormEvent) {
    e.preventDefault()
    const erros: Record<string, string> = {}
    if (!form.nome.trim()) erros.nome = 'Obrigatório.'
    if (!emailInstitucional(form.email)) erros.email = `Use o e-mail institucional (${DOMINIO_INSTITUCIONAL}).`
    if (form.senha.length < 6) erros.senha = 'Use de 6 a 72 caracteres.'
    if (!form.cursoId) erros.cursoId = 'Selecione um curso.'
    setErrosLocais(erros)
    if (Object.keys(erros).length) return

    dispatch(
      cadastrar({
        nome: form.nome.trim(),
        email: form.email.trim(),
        senha: form.senha,
        cursoId: Number(form.cursoId),
        telefone: form.telefone.trim() || undefined, // opcional
      }),
    )
  }

  // Erros locais têm prioridade; depois os que a API devolve por campo
  const erroDe = (campo: string) => errosLocais[campo] ?? erro?.campos[campo]

  return (
    <div className="card-auth">
      <h1>Criar conta</h1>
      <form className="form" onSubmit={enviar} noValidate>
        {erro && !Object.keys(erro.campos).length && <Alert>{erro.mensagem}</Alert>}
        {erroCursos && <Alert>Não foi possível carregar os cursos. Verifique se a API está no ar.</Alert>}
        <Input rotulo="Nome" value={form.nome} onChange={alterar('nome')} erro={erroDe('nome')} />
        <Input rotulo="E-mail institucional" type="email" autoComplete="email" value={form.email}
          onChange={alterar('email')} erro={erroDe('email')} placeholder={`voce${DOMINIO_INSTITUCIONAL}`} />
        <Input rotulo="Senha" type="password" autoComplete="new-password" value={form.senha}
          onChange={alterar('senha')} erro={erroDe('senha')} />
        <Select rotulo="Curso" placeholder="Selecione um curso" value={form.cursoId} onChange={alterar('cursoId')}
          opcoes={cursos.map((c) => ({ valor: c.id, rotulo: c.nome }))} erro={erroDe('cursoId')} />
        <Input rotulo="Telefone/WhatsApp" opcional value={form.telefone} onChange={alterar('telefone')}
          erro={erroDe('telefone')} placeholder="(83) 99999-0000" />
        <Button type="submit" cheio carregando={status === 'loading'}>Cadastrar</Button>
      </form>
      <p>Já tem conta? <Link to="/login">Entrar</Link></p>
    </div>
  )
}

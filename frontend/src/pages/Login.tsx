import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { entrar, limparErro } from '../store/authSlice'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'

/** RF01 — /login. Depois de entrar, o PublicOnlyRoute redireciona para a rota de origem ou /vendas. */
export function Login() {
  const dispatch = useAppDispatch()
  const { status, erro } = useAppSelector((s) => s.auth)
  // Valores digitados ficam em estado LOCAL, nunca no Redux
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  useEffect(() => {
    dispatch(limparErro())
  }, [dispatch])

  function enviar(e: FormEvent) {
    e.preventDefault()
    dispatch(entrar({ email: email.trim(), senha }))
  }

  return (
    <div className="card-auth">
      <h1>Entrar</h1>
      <form className="form" onSubmit={enviar} noValidate>
        {erro && <Alert>{erro.mensagem}</Alert>}
        <Input rotulo="E-mail" type="email" autoComplete="email" value={email}
          onChange={(e) => setEmail(e.target.value)} erro={erro?.campos.email} required />
        <Input rotulo="Senha" type="password" autoComplete="current-password" value={senha}
          onChange={(e) => setSenha(e.target.value)} erro={erro?.campos.senha} required />
        <Button type="submit" cheio carregando={status === 'loading'}>Entrar</Button>
      </form>
      <p>Não tem conta? <Link to="/cadastro">Cadastre-se</Link></p>
    </div>
  )
}

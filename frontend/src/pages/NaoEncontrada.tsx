import { Link } from 'react-router-dom'

export function NaoEncontrada() {
  return (
    <div className="card-auth">
      <h1>Página não encontrada</h1>
      <p><Link to="/vendas">Voltar para o início</Link></p>
    </div>
  )
}

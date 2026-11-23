// RF04 — /vendas. SEM Redux: busca os anúncios a partir da query string e guarda o resultado em estado local.
// Use useSearchParams para ler/escrever: categoria, precoMin, precoMax, ordem (data|preco), direcao (asc|desc), pagina, tamanho (5|10|25|50).
// API: buscarAnuncios('venda', filtros) em src/api/anuncios.ts. Categorias para o filtro: listarCategorias() em src/api/catalogo.ts.
// Sem 'ordem' na URL, o backend já devolve os mais recentes primeiro.

export function Vendas() {
  return (
    <>
      <h1>Vendas</h1>
      <p>TODO: implementar.</p>
    </>
  )
}

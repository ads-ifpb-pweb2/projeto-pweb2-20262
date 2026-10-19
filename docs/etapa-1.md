# Etapa 1 — React, React Router e Redux

Visão geral, perfis, rotas e regras gerais do projeto: [requisitos.md](requisitos.md).

**Temas:** React básico com hooks, React Router e Redux com thunks (ações assíncronas). Chamadas à API que leem ou alteram estado global partem de thunks; as demais ficam na própria página, por exemplo em um hook como `usePerfil(id)`.

## O que entregar

- RF01 Autenticação e cadastro, RF02 Perfil (itens 1 a 3), RF03 Anúncios e RF04 Busca e listagem.
- Estado global no Redux, com thunks, conforme a linha **Redux** de cada requisito.
- Componentes de UI documentados no Storybook.

## Stack e requisitos técnicos

- **React com TypeScript.**
- **React Router** para as rotas da etapa.
- **Redux com thunks:** só o estado global fica na store, e a linha **Redux** de cada requisito diz qual é. Chamadas à API que leem ou alteram estado global partem de thunks; as demais ficam na própria página.
- **UI própria:** a equipe cria os próprios componentes, sem biblioteca de componentes pronta.
- **Storybook:** todos os componentes de UI documentados em um Storybook, que só precisa rodar localmente.
- **Backend:** a equipe roda a API na própria máquina e cadastra as suas categorias no script SQL de carga.

## RF01 – Autenticação e cadastro

Rotas: `/login`, `/cadastro`.

**Redux:** estado `auth` com o usuário logado, o token e o status das requisições (carregando e erro); thunks de cadastro, login, logout e restauração da sessão ao recarregar a página. A lista de cursos e os valores digitados nos formulários ficam fora do Redux: a página de cadastro busca os cursos e guarda tudo em estado local.

1. Cadastro com nome, e-mail, senha, curso e contato (opcional).
2. O formulário rejeita e-mails fora do domínio `@academico.ifpb.edu.br`, com mensagem de erro clara (a API também valida).
3. O curso é escolhido em uma lista com os cursos do campus, fornecida pela API.
4. Login, logout e manutenção da sessão (token) entre recarregamentos da página.
5. Todas as rotas, exceto `/login`, `/cadastro` e `/admin/login`, são protegidas. Sem sessão, as rotas de estudante redirecionam para `/login`, e as rotas `/admin` redirecionam para `/admin/login`.

## RF02 – Perfil

Rotas: `/perfil`, `/perfil/editar`, `/usuarios/:id`.

**Redux:** o perfil exibido fica fora do Redux; cada página busca os seus dados e guarda em estado local. Ao salvar os próprios dados ou a foto, o usuário logado em `auth` é atualizado.

1. O perfil exibe foto, nome, curso, contato e os anúncios do usuário. Os demais estudantes veem apenas os anúncios ativos; pausados, reservados, vendidos e concluídos ficam visíveis só para o dono.
2. O usuário edita os próprios dados e envia ou troca a foto de perfil.
3. Qualquer estudante pode ver o perfil de outro estudante a partir de um anúncio.
4. Em `/perfil`, um anúncio removido pelo administrador continua visível só para o dono, marcado como "Removido pelo administrador" e com o motivo da remoção. Este item é entregue na etapa 2, junto com o RF06.

## RF03 – Anúncios

Rotas: `/anuncios/novo`, `/anuncios/:id`, `/anuncios/:id/editar`.

**Redux:** estado `anuncios` com o anúncio em detalhe e o status das requisições; thunks para buscar, criar e editar um anúncio e para alterar o seu estado. O formulário em edição e a pré-visualização das fotos ficam fora do Redux, em estado local. Mesmo sendo dados de uma página só, o anúncio fica no Redux nesta etapa para praticar thunks com carregamento e erro.

1. Campos: título, descrição, modalidade (venda ou doação), preço, estado de conservação, categoria, local de entrega (texto livre) e fotos.
2. Preço é obrigatório em vendas e oculto em doações.
3. Upload de 1 a 10 fotos, com pré-visualização, remoção e escolha da foto de capa.
4. Estados: ativo, pausado, reservado e vendido. Em doações, o estado final se chama "concluído". Apenas o anunciante altera o estado e edita o anúncio.
5. A publicação é imediata, sem moderação prévia.
6. Página de detalhe com galeria de fotos, dados do anúncio, link para o perfil do anunciante e botões "Tenho interesse" e "Negociar" (Por hora estará desabilitado e será utilizado na Etapa 3).

## RF04 – Busca e listagem

Rotas: `/vendas`, `/doacoes` (e `/`, que redireciona para `/vendas`).

**Redux:** não usa. A página busca os anúncios a partir dos parâmetros da URL e guarda os resultados em estado local. Filtros, ordenação e página ficam só na query string.

1. Duas telas de busca separadas: uma para itens à venda e outra para itens em doação.
2. As duas listam apenas anúncios ativos, com paginação tradicional.
3. Vendas: filtros por categoria e faixa de preço; ordenação por data de publicação ou por preço, em ordem crescente ou decrescente.
4. Doações: filtro por categoria; ordenação por data de publicação, em ordem crescente ou decrescente.
5. Sem ordenação na URL, as duas telas mostram os mais recentes primeiro (data decrescente).
6. Filtros, ordenação e página ficam na URL (query string), para que a busca possa ser compartilhada e restaurada. O campo da ordenação vai em `ordem` (`data` ou `preco`) e o sentido, em `direcao` (`asc` para crescente, `desc` para decrescente). Exemplos:

| Busca | Query string |
| --- | --- |
| Vendas, menor preço primeiro | `/vendas?ordem=preco&direcao=asc` |
| Vendas, maior preço primeiro | `/vendas?ordem=preco&direcao=desc` |
| Vendas, mais recentes primeiro | `/vendas?ordem=data&direcao=desc` |
| Doações, mais antigas primeiro | `/doacoes?ordem=data&direcao=asc` |
| Vendas de livros entre R$ 10 e R$ 50, menor preço primeiro, página 2 | `/vendas?categoria=livros&precoMin=10&precoMax=50&ordem=preco&direcao=asc&pagina=2` |

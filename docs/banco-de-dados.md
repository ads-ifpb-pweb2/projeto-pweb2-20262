# Banco de dados e carga

Como o banco da API é criado e atualizado, como cada equipe ajusta a carga (categorias e dados de exemplo) e o que fazer quando algo dá errado.

## Como funciona

O banco é criado e atualizado pelo [Flyway](https://documentation.red-gate.com/flyway). Os scripts ficam em `backend/db/migration` e se chamam **migrações**. Cada vez que a API sobe, ela aplica as migrações que ainda não foram aplicadas, em ordem de versão:

| Arquivo | Conteúdo |
| --- | --- |
| `V1__schema.sql` | Tabelas da etapa 1 |
| `V2__carga.sql` | Cursos, a categoria de exemplo e os dados de exemplo (um estudante, anúncios e fotos) |

O Flyway registra as migrações aplicadas na tabela `flyway_schema_history`, junto com um checksum do conteúdo de cada arquivo. Uma migração aplicada nunca roda de novo e, a partir daí, **não pode ser editada, renomeada nem apagada**: se o arquivo mudar, a API não sobe (veja [Erros comuns](#erros-comuns)).

As fotos de exemplo ficam em `backend/db/fotos`. Ao subir, a API envia para o armazenamento as que ainda não estão lá, com a chave `carga/<arquivo>`. É essa chave que as migrações usam nas colunas `foto_chave` (usuário) e `chave` (foto do anúncio).

O banco e as fotos enviadas ficam em volumes do Docker. O `docker compose down` mantém os volumes; o `docker compose down -v` apaga os dois, e na próxima subida a API recria tudo do zero a partir das migrações.

A pasta `backend/db` é montada dentro do container da API. Por isso, depois de criar ou editar uma migração, basta reiniciar a API (`docker compose restart api`); não é preciso `--build`.

## Antes da primeira inicialização: ajuste a carga

A primeira inicialização é o primeiro `docker compose up` do repositório na sua máquina. Até lá, o banco não existe e o `V2__carga.sql` pode ser editado à vontade: ele só é registrado pelo Flyway quando a API sobe pela primeira vez.

Cada integrante da equipe tem o próprio banco. Façam os ajustes da carga **antes** de todos subirem a API, e cada um faz o commit/pull da versão final antes da primeira inicialização. Se alguém já subiu, veja o passo 4.

### 1. Categorias

Troque a categoria de exemplo pelas categorias da equipe, no bloco `INSERT INTO categoria`:

```sql
INSERT INTO categoria (id, nome, slug) VALUES
  (1, 'Eletrônicos', 'eletronicos'),
  (2, 'Livros', 'livros'),
  (3, 'Material de laboratório', 'material-de-laboratorio'),
  (4, 'Roupas e uniformes', 'roupas-e-uniformes');
```

- `nome` é o texto mostrado nas telas, e precisa ser único.
- `slug` é o identificador usado na URL da busca (`/vendas?categoria=livros`). Precisa ser único e usar só letras minúsculas sem acento, números e hífen, começando por letra ou número. O banco recusa outro formato (veja [Erro de SQL](#erro-de-sql-numa-migração)).
- Mantenha os `id` explícitos: os anúncios de exemplo apontam para uma categoria pelo `categoria_id`.
- Se tirar a categoria 1 ("Eletrônicos"), troque o `categoria_id` dos anúncios de exemplo por categorias que existam, ou apague os dados de exemplo (passo 2).

### 2. Dados de exemplo

Tudo o que vem depois da linha `-- Dados de exemplo` é opcional. Escolha uma das opções:

- **Manter**: o estudante de exemplo (`estudante@academico.ifpb.edu.br`, senha `senha123`) e os 18 anúncios servem para testar a busca, a paginação e os filtros desde o primeiro dia.
- **Adaptar**: troque títulos, descrições, preços e categorias para combinar com as categorias da equipe. Respeite as regras do schema:
  - venda tem `preco_centavos` maior que zero (8000 = R$ 80,00); doação tem `preco_centavos` `NULL`;
  - `estado` é `ativo`, `pausado`, `reservado`, `vendido` (só em vendas) ou `concluido` (só em doações);
  - `estado_conservacao` é `novo`, `seminovo` ou `usado`;
  - cada anúncio tem de 1 a 10 fotos em `anuncio_foto`, com exatamente uma `capa = 1`.
- **Apagar**: remova tudo a partir da linha `-- Dados de exemplo`. O banco começa só com os cursos e as categorias. As fotos de `backend/db/fotos` podem ficar ou ser apagadas; sem referência no banco, elas não aparecem em lugar nenhum.

Para mais estudantes de exemplo, copie a linha do estudante em `INSERT INTO usuario` e troque `id`, `nome` e `email`. Use o mesmo `senha_hash`: ele é o hash da senha `senha123`. Use e-mails `@academico.ifpb.edu.br`, como no cadastro.

Para fotos novas, coloque arquivos JPEG, PNG ou WebP em `backend/db/fotos` e use `carga/<nome-do-arquivo>` na migração.

### 3. Suba a API

```bash
docker compose up --build
```

Confira o resultado em http://localhost:8080/categorias e, com login, na busca do Swagger (http://localhost:8080/swagger-ui.html).

### 4. Já subiu antes de editar?

Se a API já tinha subido uma vez, o `V2__carga.sql` já foi aplicado e a edição não tem efeito: a API para com `Migration checksum mismatch for migration version 2`. Apague o banco e suba de novo, para a carga ser aplicada do zero:

```bash
docker compose down -v
docker compose up --build
```

O `down -v` apaga também os anúncios, usuários e fotos criados até ali.

## Depois da primeira inicialização: crie migrações novas

Com o banco já criado, não edite as migrações existentes. Cada mudança nos dados vira um arquivo novo em `backend/db/migration`, e o banco é atualizado sem perder o que já foi cadastrado.

### Nome do arquivo

`V<versão>__<descrição>.sql`, com **dois** sublinhados entre a versão e a descrição. A versão usa `_` no lugar do ponto: `V2_1` é a versão 2.1.

**Os números inteiros (`V1`, `V2`, `V3`…) ficam reservados para as migrações do backend fornecido pelo professor.** As migrações da equipe usam subversões da última migração do backend:

| Última migração do backend | Migrações da equipe |
| --- | --- |
| `V2__carga.sql` (etapa 1) | `V2_1__...`, `V2_2__...`, `V2_3__...` |
| `V3__...` (quando a etapa 2 chegar) | `V3_1__...`, `V3_2__...` |

Assim, as migrações da equipe nunca têm o mesmo número de uma migração do backend, e uma migração nova sempre tem versão maior que as já aplicadas.

### Exemplos

Acrescentar categorias (`V2_1__categorias.sql`):

```sql
INSERT INTO categoria (nome, slug) VALUES
  ('Livros', 'livros'),
  ('Material de laboratório', 'material-de-laboratorio');
```

Renomear uma categoria sem mudar o slug (`V2_2__renomeia_eletronicos.sql`):

```sql
UPDATE categoria SET nome = 'Eletrônicos e informática' WHERE slug = 'eletronicos';
```

Apagar os dados de exemplo (`V2_3__remove_dados_de_exemplo.sql`). A ordem importa por causa das chaves estrangeiras; as fotos dos anúncios saem junto com eles:

```sql
DELETE FROM anuncio WHERE usuario_id = (SELECT id FROM usuario WHERE email = 'estudante@academico.ifpb.edu.br');
DELETE FROM usuario WHERE email = 'estudante@academico.ifpb.edu.br';
```

Depois de criar o arquivo, reinicie a API:

```bash
docker compose restart api
```

No log, o Flyway mostra `Migrating schema "main" to version "2.1 - categorias"` e `Successfully applied 1 migration`.

Faça o commit da migração: os colegas recebem o arquivo no pull, e a API de cada um aplica a migração na próxima subida.

### Prefere editar o `V2__carga.sql`?

Enquanto a equipe ainda está ajustando a carga e os dados do banco não importam, também dá para editar o `V2__carga.sql` e recriar o banco com `docker compose down -v` e `docker compose up --build`. Cada integrante precisa rodar o `down -v` depois do pull, e perde o que tinha cadastrado.

## Atualizar o backend para uma nova etapa

Cada etapa traz migrações novas do backend (`V3__...`, por exemplo) e não altera as anteriores. Depois de trazer a nova versão do backend para o repositório da equipe:

```bash
docker compose up --build
```

A API aplica as migrações novas do backend e mantém os dados e as migrações da equipe. Depois disso, as próximas migrações da equipe passam a usar a nova subversão (`V3_1`, `V3_2`…).

## Erros comuns

Quando uma migração tem problema, a API não sobe. A mensagem aparece no log (`docker compose logs api`), numa linha que começa com `Caused by:`.

| Mensagem | Causa | Solução |
| --- | --- | --- |
| `Migration checksum mismatch for migration version 2.1` | Uma migração já aplicada foi editada. | Desfaça a edição (`git checkout -- backend/db/migration/<arquivo>`) e coloque a mudança numa migração nova. Ou recrie o banco com `down -v`. |
| `Detected applied migration not resolved locally: 2.1.` | Uma migração já aplicada foi apagada ou renomeada. | Restaure o arquivo com o nome original. Ou recrie o banco com `down -v`. |
| `Detected resolved migration not applied to database: 2.2.` | A migração nova tem versão menor que a última aplicada (por exemplo, `V2_2` criada depois que o `V3` da etapa 2 foi aplicado). | Renomeie para uma subversão da última migração (`V3_1__...`). |
| `Found more than one migration with version 2.1` | Dois arquivos com a mesma versão, comum quando dois integrantes criam migrações ao mesmo tempo. | Renomeie um deles para a próxima versão livre (`V2_2__...`). Se um dos dois já foi aplicado em alguma máquina, renomeie o outro. |
| `Found non-empty schema(s)` | O banco foi criado por uma versão do backend anterior ao Flyway. | `docker compose down -v` e `docker compose up --build`. |

### Erro de SQL numa migração

Se o SQL de uma migração falha (sintaxe errada, slug fora do formato, chave estrangeira inexistente), o Flyway desfaz tudo o que aquela migração fez e mostra o arquivo, a linha e o erro do SQLite:

```
Migration of schema "main" to version "2.1 - categorias" failed! Changes successfully rolled back.
Line       : 1
Message    : [SQLITE_CONSTRAINT_CHECK] A CHECK constraint failed (CHECK constraint failed: slug GLOB '[a-z0-9]*' AND slug NOT GLOB '*[^a-z0-9-]*')
```

Como a migração não foi registrada, corrija o arquivo e reinicie a API.

## Testes do backend

Os testes de integração de `backend/src/test` verificam o backend com a carga original: a categoria "Eletrônicos", o estudante de exemplo e os 18 anúncios. Depois que a equipe muda o `V2__carga.sql` ou acrescenta migrações de dados, alguns deles (`CatalogoTest`, `BuscaTest` e outros) falham. Isso é esperado e não indica problema na API.

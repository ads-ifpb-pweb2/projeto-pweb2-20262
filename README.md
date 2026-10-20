# projeto-pweb2-20262

Código base para o Projeto da disciplina de PWEB2 (2026.2).

A descrição do projeto, com requisitos e etapas, está em [docs/requisitos.md](docs/requisitos.md).

Cada etapa tem o seu arquivo: [etapa 1](docs/etapa-1.md), [etapa 2](docs/etapa-2.md) e [etapa 3](docs/etapa-3.md).

As decisões do backend estão em [docs/backend.md](docs/backend.md), e o guia do banco e da carga está em [docs/banco-de-dados.md](docs/banco-de-dados.md).

## Como rodar o backend

Pré-requisito: [Docker](https://docs.docker.com/get-docker/) com o Docker Compose.

1. Copie o arquivo de variáveis de ambiente:

   ```bash
   cp .env.example .env
   ```

2. Suba a API, o banco e o armazenamento de fotos:

   ```bash
   docker compose up --build
   ```

3. Acesse:

   | Serviço | Endereço |
   | --- | --- |
   | API | http://localhost:8080 |
   | Documentação da API (Swagger) | http://localhost:8080/swagger-ui.html |
   | Console do armazenamento (fotos) | http://localhost:9001/rustfs/console/ (`S3_ACCESS_KEY` e `S3_SECRET_KEY` do `.env`) |

### Estudante de exemplo

A carga traz um estudante, dono dos anúncios de exemplo usados para testar a busca: e-mail `estudante@academico.ifpb.edu.br` e senha `senha123`. Para ver o sistema como outro estudante, cadastre-se em `POST /auth/cadastro`.

No Swagger, faça login em `POST /auth/login`, copie o `token` da resposta e clique em **Authorize**.

### Postman

A coleção [`backend/postman/marketplace.postman_collection.json`](backend/postman/marketplace.postman_collection.json) tem requisições de exemplo para todos os endpoints. Importe no Postman (**Import**) e rode primeiro a pasta **Autenticação**: o **Login** guarda o token do estudante de exemplo, e o **Cadastro** cria outro estudante para os exemplos que precisam de dois. As requisições com foto usam os arquivos de `backend/db/fotos/`. Para o Postman encontrá-los, defina a raiz do repositório em *Settings → General → Working directory*.

Para rodar a coleção inteira pelo terminal, com a API no ar:

```bash
npx newman run backend/postman/marketplace.postman_collection.json --working-dir .
```

### Banco de dados e carga

O banco é criado e atualizado pelo [Flyway](https://documentation.red-gate.com/flyway) com as migrações de `backend/db/migration`: `V1__schema.sql` (tabelas) e `V2__carga.sql` (cursos, categorias e dados de exemplo). Ao subir, a API aplica as migrações que faltam.

- **Antes da primeira inicialização** (o primeiro `docker compose up`), edite o `V2__carga.sql`: troque a categoria de exemplo pelas da equipe e adapte ou apague os dados de exemplo.
- **Depois**, não edite mais as migrações existentes. Cada mudança vira uma migração nova, com uma subversão da última migração do backend (`V2_1__categorias.sql`, por exemplo). Os números inteiros ficam reservados para as etapas.
- **Numa nova etapa**, o backend traz migrações novas e basta `docker compose up --build`: o banco é atualizado sem perder os dados.

Para recriar o banco do zero com as migrações (apaga também as fotos enviadas):

```bash
docker compose down -v
docker compose up --build
```

O passo a passo, com exemplos e a solução dos erros mais comuns, está em [docs/banco-de-dados.md](docs/banco-de-dados.md).

## Testes da API

Os testes de integração ficam em `backend/src/test`. Cada classe sobe a API com um banco novo (aplicando as migrações de `backend/db/migration`) e um armazenamento RustFS real, criado pelo [Testcontainers](https://testcontainers.com). É preciso ter o Docker rodando.

Com Java 25 instalado:

```bash
cd backend
./mvnw test
```

Sem Java 25, pelo Docker:

```bash
cd backend
docker run --rm -v "$PWD":/build -v marketplace-m2:/root/.m2 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e TESTCONTAINERS_HOST_OVERRIDE=host.docker.internal \
  -w /build maven:3.9-eclipse-temurin-25 mvn -B test
```

-- Schema do Marketplace IFPB Cajazeiras (etapa 1).
-- A API aplica este arquivo, e depois o carga.sql, quando o banco está vazio.
-- Datas em texto ISO 8601 (UTC). Preço em centavos.

CREATE TABLE curso (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL UNIQUE
);

CREATE TABLE categoria (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL UNIQUE,
  -- Identificador usado na URL e no filtro da busca (?categoria=eletronicos)
  slug TEXT NOT NULL UNIQUE CHECK (slug GLOB '[a-z0-9]*' AND slug NOT GLOB '*[^a-z0-9-]*')
);

CREATE TABLE usuario (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  nome       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE COLLATE NOCASE,
  senha_hash TEXT NOT NULL,
  papel      TEXT NOT NULL DEFAULT 'estudante' CHECK (papel IN ('estudante', 'administrador')),
  curso_id   INTEGER REFERENCES curso (id),  -- NULL para administrador
  telefone   TEXT,
  foto_chave TEXT,                           -- chave do objeto no bucket
  criado_em  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  CHECK (papel = 'administrador' OR curso_id IS NOT NULL)
);

CREATE TABLE anuncio (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id         INTEGER NOT NULL REFERENCES usuario (id),
  categoria_id       INTEGER NOT NULL REFERENCES categoria (id),
  titulo             TEXT NOT NULL,
  descricao          TEXT NOT NULL,
  modalidade         TEXT NOT NULL CHECK (modalidade IN ('venda', 'doacao')),
  preco_centavos     INTEGER,                -- NULL em doação
  estado_conservacao TEXT NOT NULL CHECK (estado_conservacao IN ('novo', 'seminovo', 'usado')),
  local_entrega      TEXT NOT NULL,
  estado             TEXT NOT NULL DEFAULT 'ativo'
                     CHECK (estado IN ('ativo', 'pausado', 'reservado', 'vendido', 'concluido')),
  publicado_em       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  atualizado_em      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  CHECK ((modalidade = 'venda'  AND preco_centavos > 0 AND estado <> 'concluido') OR
         (modalidade = 'doacao' AND preco_centavos IS NULL AND estado <> 'vendido'))
);

CREATE INDEX idx_anuncio_busca ON anuncio (modalidade, estado, publicado_em);
CREATE INDEX idx_anuncio_usuario ON anuncio (usuario_id);

CREATE TABLE anuncio_foto (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  anuncio_id INTEGER NOT NULL REFERENCES anuncio (id) ON DELETE CASCADE,
  chave      TEXT NOT NULL,
  ordem      INTEGER NOT NULL,
  capa       INTEGER NOT NULL DEFAULT 0 CHECK (capa IN (0, 1))
);

CREATE INDEX idx_foto_anuncio ON anuncio_foto (anuncio_id, ordem);
-- No máximo uma capa por anúncio
CREATE UNIQUE INDEX idx_foto_capa ON anuncio_foto (anuncio_id) WHERE capa = 1;

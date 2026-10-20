-- Dados iniciais do Marketplace IFPB Cajazeiras.
-- A API aplica este arquivo quando o banco está vazio. Depois de editá-lo, rode:
--   docker compose down -v && docker compose up --build

-- Cursos do campus
INSERT INTO curso (nome) VALUES
  ('Análise e Desenvolvimento de Sistemas'),
  ('Engenharia de Controle e Automação'),
  ('Engenharia Civil'),
  ('Licenciatura em Matemática'),
  ('Técnico Integrado em Edificações'),
  ('Técnico Integrado em Eletromecânica'),
  ('Técnico Integrado em Informática'),
  ('Técnico Subsequente em Edificações'),
  ('Técnico Subsequente em Eletromecânica'),
  ('Técnico em Meio Ambiente');

-- Categorias: troque ou acrescente as da sua equipe.
-- O slug vai na URL da busca (?categoria=eletronicos): minúsculas, sem acentos, hífen no lugar de espaços.
INSERT INTO categoria (id, nome, slug) VALUES
  (1, 'Eletrônicos', 'eletronicos');

-- ---------------------------------------------------------------------------
-- Dados de exemplo, para testar a busca. Pode apagar daqui para baixo.
-- O estudante de exemplo usa a senha "senha123".
-- As fotos ficam em backend/db/fotos/ e são enviadas ao armazenamento com a chave carga/<arquivo>.
-- ---------------------------------------------------------------------------

INSERT INTO usuario (id, nome, email, senha_hash, papel, curso_id, telefone, foto_chave, criado_em) VALUES
  (1, 'Estudante de Exemplo', 'estudante@academico.ifpb.edu.br', '$2y$10$gSKL.siB69Xlo8mvaO17QOXct0eEke9fMD7DTL5pmmOoGCBNtS8BW', 'estudante', 1, '(83) 99999-0001', 'carga/usuario-estudante.jpg', '2026-09-01T12:00:00Z');

-- Preço em centavos (8000 = R$ 80,00); NULL em doações.
-- Estados: ativo, pausado, reservado, vendido (só vendas) e concluido (só doações).
INSERT INTO anuncio (id, usuario_id, categoria_id, titulo, descricao, modalidade, preco_centavos, estado_conservacao, local_entrega, estado, publicado_em, atualizado_em) VALUES
  (1,  1, 1, 'Fone de ouvido Bluetooth', 'Fone sem fio com estojo de carga. Bateria dura cerca de 8 horas.', 'venda', 8000, 'seminovo', 'Bloco de Informática, intervalo da manhã', 'ativo', '2026-09-05T13:10:00Z', '2026-09-05T13:10:00Z'),
  (2,  1, 1, 'Mouse sem fio', 'Mouse sem fio com receptor USB. Acompanha pilha.', 'venda', 4500, 'usado', 'Biblioteca', 'ativo', '2026-09-08T15:00:00Z', '2026-09-08T15:00:00Z'),
  (3,  1, 1, 'Teclado mecânico', 'Teclado mecânico ABNT2 com iluminação. Todas as teclas funcionando.', 'venda', 15000, 'seminovo', 'Bloco de Informática', 'reservado', '2026-09-10T10:30:00Z', '2026-09-20T18:00:00Z'),
  (4,  1, 1, 'Carregador de notebook', 'Carregador universal 90 W com várias pontas. Funciona, mas o cabo tem marcas de uso.', 'doacao', NULL, 'usado', 'Cantina', 'ativo', '2026-09-12T11:45:00Z', '2026-09-12T11:45:00Z'),
  (5,  1, 1, 'Calculadora científica', 'Calculadora científica, ideal para Cálculo e Física.', 'venda', 6000, 'usado', 'Bloco de Matemática', 'vendido', '2026-09-14T09:00:00Z', '2026-09-25T09:00:00Z'),
  (6,  1, 1, 'Pen drive 16 GB', 'Pen drive novo, ainda na embalagem.', 'doacao', NULL, 'novo', 'Biblioteca', 'pausado', '2026-09-15T16:20:00Z', '2026-09-18T16:20:00Z'),
  (7,  1, 1, 'Arduino Uno com kit de sensores', 'Arduino Uno com protoboard, sensores de temperatura, ultrassom e LDR, e cabos.', 'venda', 12000, 'seminovo', 'Laboratório de Automação', 'ativo', '2026-09-18T14:00:00Z', '2026-09-18T14:00:00Z'),
  (8,  1, 1, 'Raspberry Pi 4 (4 GB)', 'Raspberry Pi 4 com case, fonte oficial e cartão de 32 GB.', 'venda', 35000, 'seminovo', 'Laboratório de Automação', 'ativo', '2026-09-22T10:00:00Z', '2026-09-22T10:00:00Z'),
  (9,  1, 1, 'Multímetro digital', 'Multímetro com pontas de prova. Mede tensão, corrente, resistência e continuidade.', 'venda', 7000, 'usado', 'Bloco de Eletromecânica', 'ativo', '2026-09-25T17:30:00Z', '2026-09-25T17:30:00Z'),
  (10, 1, 1, 'Cabo HDMI 2 m', 'Cabo HDMI de 2 metros, sem uso.', 'doacao', NULL, 'novo', 'Portaria principal', 'ativo', '2026-09-28T08:15:00Z', '2026-09-28T08:15:00Z'),
  (11, 1, 1, 'Monitor 22 polegadas', 'Monitor Full HD de 22 polegadas com entrada HDMI e VGA. Sem pixels mortos.', 'venda', 45000, 'usado', 'Combinar pelo chat', 'ativo', '2026-10-01T19:00:00Z', '2026-10-01T19:00:00Z'),
  (12, 1, 1, 'Protoboard e jumpers', 'Protoboard de 830 pontos com cerca de 60 jumpers.', 'doacao', NULL, 'usado', 'Laboratório de Automação', 'concluido', '2026-10-02T13:00:00Z', '2026-10-06T13:00:00Z'),
  (13, 1, 1, 'Notebook Lenovo IdeaPad', 'Notebook com Core i5, 8 GB de RAM e SSD de 256 GB. Bateria dura cerca de 3 horas.', 'venda', 180000, 'usado', 'Bloco de Informática, à tarde', 'ativo', '2026-10-04T15:40:00Z', '2026-10-04T15:40:00Z'),
  (14, 1, 1, 'Webcam Full HD', 'Webcam 1080p com microfone embutido.', 'venda', 9000, 'seminovo', 'Biblioteca', 'ativo', '2026-10-07T11:00:00Z', '2026-10-07T11:00:00Z'),
  (15, 1, 1, 'Caixa de som portátil', 'Caixa de som Bluetooth à prova de respingos.', 'venda', 11000, 'novo', 'Cantina', 'pausado', '2026-10-09T12:30:00Z', '2026-10-10T12:30:00Z'),
  (16, 1, 1, 'Mouse pad gamer', 'Mouse pad grande, 80 x 30 cm.', 'doacao', NULL, 'seminovo', 'Bloco de Informática', 'ativo', '2026-10-11T09:45:00Z', '2026-10-11T09:45:00Z'),
  (17, 1, 1, 'Fonte de alimentação 12 V', 'Fonte 12 V 2 A, serve para fitas de LED e roteadores.', 'doacao', NULL, 'usado', 'Portaria principal', 'ativo', '2026-10-14T14:10:00Z', '2026-10-14T14:10:00Z'),
  (18, 1, 1, 'HD externo 1 TB', 'HD externo USB 3.0 de 1 TB, formatado.', 'venda', 20000, 'seminovo', 'Biblioteca', 'ativo', '2026-10-16T16:00:00Z', '2026-10-16T16:00:00Z');

-- A primeira foto de cada anúncio é a capa (capa = 1).
INSERT INTO anuncio_foto (anuncio_id, chave, ordem, capa) VALUES
  (1,  'carga/anuncio-01-1.jpg', 0, 1), (1,  'carga/anuncio-01-2.jpg', 1, 0),
  (2,  'carga/anuncio-02-1.jpg', 0, 1),
  (3,  'carga/anuncio-03-1.jpg', 0, 1), (3,  'carga/anuncio-03-2.jpg', 1, 0),
  (4,  'carga/anuncio-04-1.jpg', 0, 1),
  (5,  'carga/anuncio-05-1.jpg', 0, 1),
  (6,  'carga/anuncio-06-1.jpg', 0, 1),
  (7,  'carga/anuncio-07-1.jpg', 0, 1), (7,  'carga/anuncio-07-2.jpg', 1, 0), (7,  'carga/anuncio-07-3.jpg', 2, 0),
  (8,  'carga/anuncio-08-1.jpg', 0, 1), (8,  'carga/anuncio-08-2.jpg', 1, 0),
  (9,  'carga/anuncio-09-1.jpg', 0, 1),
  (10, 'carga/anuncio-10-1.jpg', 0, 1),
  (11, 'carga/anuncio-11-1.jpg', 0, 1), (11, 'carga/anuncio-11-2.jpg', 1, 0),
  (12, 'carga/anuncio-12-1.jpg', 0, 1),
  (13, 'carga/anuncio-13-1.jpg', 0, 1), (13, 'carga/anuncio-13-2.jpg', 1, 0), (13, 'carga/anuncio-13-3.jpg', 2, 0),
  (14, 'carga/anuncio-14-1.jpg', 0, 1),
  (15, 'carga/anuncio-15-1.jpg', 0, 1),
  (16, 'carga/anuncio-16-1.jpg', 0, 1),
  (17, 'carga/anuncio-17-1.jpg', 0, 1),
  (18, 'carga/anuncio-18-1.jpg', 0, 1), (18, 'carga/anuncio-18-2.jpg', 1, 0);

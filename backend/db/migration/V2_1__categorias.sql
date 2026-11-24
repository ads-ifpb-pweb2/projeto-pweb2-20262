INSERT INTO categoria (nome, slug) VALUES
  ('Livros e apostilas', 'livros-e-apostilas'),
  ('Material escolar e acadêmico', 'material-escolar-e-academico'),
  ('Móveis e casa', 'moveis-e-casa'),
  ('Roupas e calçados', 'roupas-e-calcados'),
  ('Esporte e lazer', 'esporte-e-lazer'),
  ('Outros', 'outros');

UPDATE anuncio
   SET categoria_id = (SELECT id FROM categoria WHERE slug = 'material-escolar-e-academico')
 WHERE titulo IN ('Calculadora científica', 'Multímetro digital', 'Protoboard e jumpers');

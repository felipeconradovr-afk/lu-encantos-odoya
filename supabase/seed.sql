-- Seed inicial: preserva os 8 produtos demo e as 7 categorias atuais.
-- Idempotente: pode rodar mais de uma vez sem duplicar (upsert por code/slug).
-- Rode APÓS supabase/schema.sql no SQL Editor.

-- Categorias ---------------------------------------------------------------
insert into public.categories (name, slug, position, active) values
  ('Colares', 'colares', 1, true),
  ('Pulseiras', 'pulseiras', 2, true),
  ('Guias', 'guias', 3, true),
  ('Adereços', 'aderecos', 4, true),
  ('Acessórios', 'acessorios', 5, true),
  ('Peças personalizadas', 'pecas-personalizadas', 6, true),
  ('Novidades', 'novidades', 7, true)
on conflict (slug) do update set
  name = excluded.name,
  position = excluded.position,
  active = excluded.active;

-- Produtos -----------------------------------------------------------------
insert into public.products
  (code, name, slug, description, price, category_id, materials, size, colors,
   status, production_time, featured, active, sort_order)
select
  s.code, s.name, s.slug, s.description, s.price,
  (select id from public.categories where slug = s.category_slug),
  s.materials, s.size, s.colors, s.status::text, s.production_time,
  s.featured, true, s.sort_order
from (values
  ('LU-001', 'Colar Vermelho e Preto com Flor', 'colar-vermelho-e-preto-com-flor',
   'Um encontro de cores intensas e um detalhe floral que faz a diferença. Uma proposta para quem gosta de acessórios com presença.',
   89, 'colares', 'Miçangas de vidro e detalhe floral', 'Comprimento a combinar',
   'Vermelho e preto', 'Disponível', 'Confirmar disponibilidade com a Lu', true, 1),
  ('LU-002', 'Pulseira Artesanal Preto e Vermelho', 'pulseira-artesanal-preto-e-vermelho',
   'Uma combinação marcante para usar sozinha ou junto de outras pulseiras. O tamanho pode ser ajustado na encomenda.',
   35, 'pulseiras', 'Miçangas e fio elástico', 'Ajustável, confirmar medida',
   'Preto e vermelho', 'Disponível', 'Confirmar disponibilidade com a Lu', false, 2),
  ('LU-003', 'Colar Imperial com Cristais', 'colar-imperial-com-cristais',
   'Cristais em uma composição delicada, com pontos de luz entre as contas. Um toque especial para os seus dias.',
   129, 'colares', 'Cristais, contas de vidro e fecho metálico', 'Comprimento a combinar',
   'Lilás e translúcido', 'Peça única', 'Confirmar disponibilidade com a Lu', true, 3),
  ('LU-004', 'Guia Colorida com Miçangas', 'guia-colorida-com-micangas',
   'Cores e sequência de contas escolhidas com você. Conte à Lu suas referências e o significado que deseja dar à peça.',
   75, 'guias', 'Miçangas de vidro e fio resistente', 'Medida a combinar',
   'Multicolorido', 'Sob encomenda', 'Prazo combinado antes da produção', false, 4),
  ('LU-005', 'Adorno Artesanal para Carro', 'adorno-artesanal-para-carro',
   'Um pequeno detalhe artesanal para acompanhar seus caminhos. Cores e comprimento podem ser combinados pelo WhatsApp.',
   49, 'acessorios', 'Contas de vidro e cordão', 'Medida a combinar',
   'Rosa e perolado', 'Sob encomenda', 'Prazo combinado antes da produção', false, 5),
  ('LU-006', 'Colar Azul com Cristais', 'colar-azul-com-cristais',
   'Tons de azul e transparências em uma peça leve. Esta proposta pode inspirar uma nova combinação feita para você.',
   98, 'colares', 'Cristais azuis e contas de vidro', 'Comprimento a combinar',
   'Azul e transparente', 'Esgotado', 'Confirmar disponibilidade com a Lu', true, 6),
  ('LU-007', 'Pulseira Personalizada', 'pulseira-personalizada',
   'Sua cor favorita, uma medida confortável, um detalhe especial. Uma pulseira que começa com a sua ideia.',
   null, 'pecas-personalizadas', 'Materiais definidos na encomenda', 'Ajustável, confirmar medida',
   'À sua escolha', 'Sob encomenda', 'Prazo combinado antes da produção', false, 7),
  ('LU-008', 'Peça Artesanal Branco e Preto', 'peca-artesanal-branco-e-preto',
   'Contrastes simples em uma composição artesanal. Converse com a Lu sobre como adaptar o adereço para seu uso.',
   59, 'aderecos', 'Miçangas, contas e cordão', 'Medida a combinar',
   'Branco e preto', 'Peça única', 'Confirmar disponibilidade com a Lu', false, 8)
) as s(code, name, slug, description, price, category_slug, materials, size,
        colors, status, production_time, featured, sort_order)
on conflict (code) do update set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  price = excluded.price,
  category_id = excluded.category_id,
  materials = excluded.materials,
  size = excluded.size,
  colors = excluded.colors,
  status = excluded.status,
  production_time = excluded.production_time,
  featured = excluded.featured,
  sort_order = excluded.sort_order;

-- Configurações ------------------------------------------------------------
insert into public.site_settings (key, value) values
  ('whatsapp', '5548991893262'),
  ('instagram', ''),
  ('about', 'Cada peça começa com uma combinação: uma cor que chama, uma textura que encanta, um detalhe que faz sentido. Na Lu by Encantos Odoyá, miçangas, cristais e adornos ganham forma em criações artesanais. Você pode escolher uma proposta do catálogo ou contar sua ideia para criar algo personalizado.')
on conflict (key) do nothing;

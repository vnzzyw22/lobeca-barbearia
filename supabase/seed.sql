-- Lobeca Barbershop (Apucarana – PR). Espelha src/content/lobeca.ts.
-- WhatsApp e Instagram: canais oficiais (linktr.ee/lobecabarbershop).
-- Endereço de rua NÃO verificado (fontes de terceiros divergem): fica nulo.
-- Horário abaixo é DEMONSTRATIVO (não confirmado) — ajustar no painel antes de abrir o agendamento real.
insert into public.business_settings (id, name, whatsapp, instagram, address, business_hours)
values (
  '00000000-0000-0000-0000-000000000001',
  'Lobeca Barbershop',
  '5543999172749',
  'lobecabarbershop',
  null,
  '{
    "mon": {"open": "09:00", "close": "19:00"},
    "tue": {"open": "09:00", "close": "19:00"},
    "wed": {"open": "09:00", "close": "19:00"},
    "thu": {"open": "09:00", "close": "19:00"},
    "fri": {"open": "09:00", "close": "19:00"},
    "sat": {"open": "09:00", "close": "17:00"},
    "sun": {"closed": true}
  }'::jsonb
);

-- Catálogo enviado pelo cliente (preços reais). "A partir de" vai em description,
-- convenção do sistema. DURAÇÕES SÃO DEMONSTRATIVAS: confirmar com a equipe.
insert into public.services (name, description, price, duration_minutes, display_order) values
  ('Corte',                               null,          75.00, 45,  1),
  ('Corte adicional',                     null,          75.00, 45,  2),
  ('Corte assinatura exclusive',          null,          75.00, 45,  3),
  ('Reconstrução de fios — Hidratação',   'A partir de', 29.00, 30,  4),
  ('Selagem de fios / Progressiva',       'A partir de', 119.00, 90, 5),
  ('Camuflagem Cabelo — Pigmentação',     null,          45.00, 30,  6),
  ('Barba',                               null,          65.00, 30,  7),
  ('Barba assinatura exclusive',          null,          65.00, 30,  8),
  ('Camuflagem Barba — Pigmentação',      null,          45.00, 30,  9),
  ('Design masculino — Sobrancelhas',     null,          29.00, 15, 10),
  ('Esfoliação + máscara',                null,          29.00, 30, 11),
  ('Acabamento — Pézinho',                null,          25.00, 15, 12),
  ('Depilação orelha — auricular',        null,          25.00, 15, 13),
  ('Depilação nasal',                     null,          25.00, 15, 14);

-- PLACEHOLDER: a equipe real ainda não foi enviada (cadastrar em /admin/equipe).
insert into public.staff (name, role, photo_url, display_order) values
  ('Profissional A', 'Barbeiro', null, 1),
  ('Profissional B', 'Barbeiro', null, 2),
  ('Profissional C', 'Barbeiro', null, 3);

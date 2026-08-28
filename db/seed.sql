-- The ten listings the site shipped with, lifted out of
-- components/apartments-data.ts and components/i18n/dictionary.ts so nothing
-- changes visually the moment the site starts reading from the database.
--
--   psql "$DATABASE_URL" -f db/seed.sql
--
-- Safe to re-run: it upserts on slug. It will overwrite admin edits to these
-- ten, so run it once at setup and not again.

insert into listings
  (slug, price, per_day, rooms, seats, area, image_url,
   name_en, name_fr, kind_en, kind_fr, position, published)
values
  ('the-penthouse',     120000, false, 4,  false, '210 m²', '/pexels-artbovich-7061395.jpg',
   'The Penthouse', 'Le Penthouse', 'Penthouse', 'Penthouse', 0, true),

  ('garden-villa',      145000, false, 6,  false, '340 m²', '/pexels-ahmetcotur-26859037.jpg',
   'Garden Villa', 'Villa Jardin', 'Villa', 'Villa', 1, true),

  ('skyline-apartment',  58000, false, 3,  false, '124 m²', '/pexels-dropshado-12784156.jpg',
   'Skyline Apartment', 'Appartement Panorama', 'Apartment', 'Appartement', 2, true),

  ('the-assembly',      150000, true,  90, true,  '180 m²', '/pexels-keeganjchecks-10117735.jpg',
   'The Assembly', 'L''Assemblée', 'Conference hall', 'Salle de conférence', 3, true),

  ('studio-one',         28000, false, 1,  false, '48 m²',  '/pexels-zynaly-27822509.jpg',
   'Studio One', 'Studio Un', 'Studio', 'Studio', 4, true),

  ('terrace-suite',      72000, false, 3,  false, '140 m²', '/pexels-artbovich-7061426.jpg',
   'Terrace Suite', 'Suite Terrasse', 'Suite', 'Suite', 5, true),

  ('loft-duplex',        85000, false, 4,  false, '165 m²', '/pexels-ahmetcotur-20975733.jpg',
   'Loft Duplex', 'Loft Duplex', 'Duplex', 'Duplex', 6, true),

  ('poolside-villa',    135000, false, 5,  false, '300 m²', '/pexels-asadphoto-12720684.jpg',
   'Poolside Villa', 'Villa Piscine', 'Villa', 'Villa', 7, true),

  ('corner-residence',   45000, false, 2,  false, '96 m²',  '/pexels-didi-lecatompessy-2149441489-30821350.jpg',
   'Corner Residence', 'Résidence d''Angle', 'Apartment', 'Appartement', 8, true),

  ('north-atelier',      25000, false, 1,  false, '42 m²',  '/pexels-essahak-shyam-2160973582-37276162.jpg',
   'North Atelier', 'Atelier Nord', 'Studio', 'Studio', 9, true)

on conflict (slug) do update set
  price = excluded.price, per_day = excluded.per_day, rooms = excluded.rooms,
  seats = excluded.seats, area = excluded.area, image_url = excluded.image_url,
  name_en = excluded.name_en, name_fr = excluded.name_fr,
  kind_en = excluded.kind_en, kind_fr = excluded.kind_fr,
  position = excluded.position, published = excluded.published,
  updated_at = now();

-- ------------------------------------------------------------------- rooms
--
-- The four parts every listing showed before rooms became editable, with the
-- copy lifted out of components/i18n/dictionary.ts and the photograph each
-- listing was already using. Seeding this reproduces the site exactly.
--
-- Re-runnable, but destructive to these ten: the delete below clears their
-- rooms first (galleries cascade with them) so a second run cannot end up
-- with four parlours. Rooms the admin has ADDED to these ten listings are
-- cleared too, so run this once at setup and not again.
delete from rooms where slug in (
  'the-penthouse',
  'garden-villa',
  'skyline-apartment',
  'the-assembly',
  'studio-one',
  'terrace-suite',
  'loft-duplex',
  'poolside-villa',
  'corner-residence',
  'north-atelier'
);

-- the-penthouse
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('the-penthouse', 0, 'Parlour', 'Salon',
          '[{"label":"Dimensions","value":"6.2 × 4.8 m"},{"label":"Wall sockets","value":"8"},{"label":"Windows","value":"3 — south facing"},{"label":"Flooring","value":"Oak parquet"}]'::jsonb, '[{"label":"Dimensions","value":"6,2 × 4,8 m"},{"label":"Prises murales","value":"8"},{"label":"Fenêtres","value":"3 — plein sud"},{"label":"Sol","value":"Parquet en chêne"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/parlour1.jpg', 0 from room;
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('the-penthouse', 1, 'Kitchen', 'Cuisine',
          '[{"label":"Dimensions","value":"4.1 × 3.4 m"},{"label":"Wall sockets","value":"12"},{"label":"Windows","value":"1 — east facing"},{"label":"Worktop","value":"Honed granite"}]'::jsonb, '[{"label":"Dimensions","value":"4,1 × 3,4 m"},{"label":"Prises murales","value":"12"},{"label":"Fenêtres","value":"1 — plein est"},{"label":"Plan de travail","value":"Granit adouci"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/kitchen1.jpg', 0 from room;
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('the-penthouse', 2, 'Bedroom', 'Chambre',
          '[{"label":"Dimensions","value":"4.6 × 3.9 m"},{"label":"Wall sockets","value":"6"},{"label":"Windows","value":"2 — north facing"},{"label":"Flooring","value":"Oak parquet"}]'::jsonb, '[{"label":"Dimensions","value":"4,6 × 3,9 m"},{"label":"Prises murales","value":"6"},{"label":"Fenêtres","value":"2 — plein nord"},{"label":"Sol","value":"Parquet en chêne"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/bedroom1.jpg', 0 from room;
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('the-penthouse', 3, 'Toilet', 'Salle d''eau',
          '[{"label":"Dimensions","value":"2.4 × 1.8 m"},{"label":"Wall sockets","value":"2"},{"label":"Ventilation","value":"Mechanical extract"},{"label":"Flooring","value":"Porcelain tile"}]'::jsonb, '[{"label":"Dimensions","value":"2,4 × 1,8 m"},{"label":"Prises murales","value":"2"},{"label":"Ventilation","value":"Extraction mécanique"},{"label":"Sol","value":"Grès cérame"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/toilet1.jpg', 0 from room;

-- garden-villa
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('garden-villa', 0, 'Parlour', 'Salon',
          '[{"label":"Dimensions","value":"6.2 × 4.8 m"},{"label":"Wall sockets","value":"8"},{"label":"Windows","value":"3 — south facing"},{"label":"Flooring","value":"Oak parquet"}]'::jsonb, '[{"label":"Dimensions","value":"6,2 × 4,8 m"},{"label":"Prises murales","value":"8"},{"label":"Fenêtres","value":"3 — plein sud"},{"label":"Sol","value":"Parquet en chêne"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/parlour2.jpg', 0 from room;
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('garden-villa', 1, 'Kitchen', 'Cuisine',
          '[{"label":"Dimensions","value":"4.1 × 3.4 m"},{"label":"Wall sockets","value":"12"},{"label":"Windows","value":"1 — east facing"},{"label":"Worktop","value":"Honed granite"}]'::jsonb, '[{"label":"Dimensions","value":"4,1 × 3,4 m"},{"label":"Prises murales","value":"12"},{"label":"Fenêtres","value":"1 — plein est"},{"label":"Plan de travail","value":"Granit adouci"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/kitchen2.jpg', 0 from room;
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('garden-villa', 2, 'Bedroom', 'Chambre',
          '[{"label":"Dimensions","value":"4.6 × 3.9 m"},{"label":"Wall sockets","value":"6"},{"label":"Windows","value":"2 — north facing"},{"label":"Flooring","value":"Oak parquet"}]'::jsonb, '[{"label":"Dimensions","value":"4,6 × 3,9 m"},{"label":"Prises murales","value":"6"},{"label":"Fenêtres","value":"2 — plein nord"},{"label":"Sol","value":"Parquet en chêne"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/bedroom2.jpg', 0 from room;
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('garden-villa', 3, 'Toilet', 'Salle d''eau',
          '[{"label":"Dimensions","value":"2.4 × 1.8 m"},{"label":"Wall sockets","value":"2"},{"label":"Ventilation","value":"Mechanical extract"},{"label":"Flooring","value":"Porcelain tile"}]'::jsonb, '[{"label":"Dimensions","value":"2,4 × 1,8 m"},{"label":"Prises murales","value":"2"},{"label":"Ventilation","value":"Extraction mécanique"},{"label":"Sol","value":"Grès cérame"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/toilet2.jpg', 0 from room;

-- skyline-apartment
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('skyline-apartment', 0, 'Parlour', 'Salon',
          '[{"label":"Dimensions","value":"6.2 × 4.8 m"},{"label":"Wall sockets","value":"8"},{"label":"Windows","value":"3 — south facing"},{"label":"Flooring","value":"Oak parquet"}]'::jsonb, '[{"label":"Dimensions","value":"6,2 × 4,8 m"},{"label":"Prises murales","value":"8"},{"label":"Fenêtres","value":"3 — plein sud"},{"label":"Sol","value":"Parquet en chêne"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/parlour3.jpg', 0 from room;
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('skyline-apartment', 1, 'Kitchen', 'Cuisine',
          '[{"label":"Dimensions","value":"4.1 × 3.4 m"},{"label":"Wall sockets","value":"12"},{"label":"Windows","value":"1 — east facing"},{"label":"Worktop","value":"Honed granite"}]'::jsonb, '[{"label":"Dimensions","value":"4,1 × 3,4 m"},{"label":"Prises murales","value":"12"},{"label":"Fenêtres","value":"1 — plein est"},{"label":"Plan de travail","value":"Granit adouci"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/kitchen3.jpg', 0 from room;
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('skyline-apartment', 2, 'Bedroom', 'Chambre',
          '[{"label":"Dimensions","value":"4.6 × 3.9 m"},{"label":"Wall sockets","value":"6"},{"label":"Windows","value":"2 — north facing"},{"label":"Flooring","value":"Oak parquet"}]'::jsonb, '[{"label":"Dimensions","value":"4,6 × 3,9 m"},{"label":"Prises murales","value":"6"},{"label":"Fenêtres","value":"2 — plein nord"},{"label":"Sol","value":"Parquet en chêne"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/bedroom3.jpg', 0 from room;
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('skyline-apartment', 3, 'Toilet', 'Salle d''eau',
          '[{"label":"Dimensions","value":"2.4 × 1.8 m"},{"label":"Wall sockets","value":"2"},{"label":"Ventilation","value":"Mechanical extract"},{"label":"Flooring","value":"Porcelain tile"}]'::jsonb, '[{"label":"Dimensions","value":"2,4 × 1,8 m"},{"label":"Prises murales","value":"2"},{"label":"Ventilation","value":"Extraction mécanique"},{"label":"Sol","value":"Grès cérame"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/toilet3.jpg', 0 from room;

-- the-assembly
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('the-assembly', 0, 'Parlour', 'Salon',
          '[{"label":"Dimensions","value":"6.2 × 4.8 m"},{"label":"Wall sockets","value":"8"},{"label":"Windows","value":"3 — south facing"},{"label":"Flooring","value":"Oak parquet"}]'::jsonb, '[{"label":"Dimensions","value":"6,2 × 4,8 m"},{"label":"Prises murales","value":"8"},{"label":"Fenêtres","value":"3 — plein sud"},{"label":"Sol","value":"Parquet en chêne"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/parlour4.jpg', 0 from room;
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('the-assembly', 1, 'Kitchen', 'Cuisine',
          '[{"label":"Dimensions","value":"4.1 × 3.4 m"},{"label":"Wall sockets","value":"12"},{"label":"Windows","value":"1 — east facing"},{"label":"Worktop","value":"Honed granite"}]'::jsonb, '[{"label":"Dimensions","value":"4,1 × 3,4 m"},{"label":"Prises murales","value":"12"},{"label":"Fenêtres","value":"1 — plein est"},{"label":"Plan de travail","value":"Granit adouci"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/kitchen4.jpg', 0 from room;
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('the-assembly', 2, 'Bedroom', 'Chambre',
          '[{"label":"Dimensions","value":"4.6 × 3.9 m"},{"label":"Wall sockets","value":"6"},{"label":"Windows","value":"2 — north facing"},{"label":"Flooring","value":"Oak parquet"}]'::jsonb, '[{"label":"Dimensions","value":"4,6 × 3,9 m"},{"label":"Prises murales","value":"6"},{"label":"Fenêtres","value":"2 — plein nord"},{"label":"Sol","value":"Parquet en chêne"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/bedroom4.jpg', 0 from room;
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('the-assembly', 3, 'Toilet', 'Salle d''eau',
          '[{"label":"Dimensions","value":"2.4 × 1.8 m"},{"label":"Wall sockets","value":"2"},{"label":"Ventilation","value":"Mechanical extract"},{"label":"Flooring","value":"Porcelain tile"}]'::jsonb, '[{"label":"Dimensions","value":"2,4 × 1,8 m"},{"label":"Prises murales","value":"2"},{"label":"Ventilation","value":"Extraction mécanique"},{"label":"Sol","value":"Grès cérame"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/toilet4.jpg', 0 from room;

-- studio-one
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('studio-one', 0, 'Parlour', 'Salon',
          '[{"label":"Dimensions","value":"6.2 × 4.8 m"},{"label":"Wall sockets","value":"8"},{"label":"Windows","value":"3 — south facing"},{"label":"Flooring","value":"Oak parquet"}]'::jsonb, '[{"label":"Dimensions","value":"6,2 × 4,8 m"},{"label":"Prises murales","value":"8"},{"label":"Fenêtres","value":"3 — plein sud"},{"label":"Sol","value":"Parquet en chêne"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/parlour5.jpg', 0 from room;
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('studio-one', 1, 'Kitchen', 'Cuisine',
          '[{"label":"Dimensions","value":"4.1 × 3.4 m"},{"label":"Wall sockets","value":"12"},{"label":"Windows","value":"1 — east facing"},{"label":"Worktop","value":"Honed granite"}]'::jsonb, '[{"label":"Dimensions","value":"4,1 × 3,4 m"},{"label":"Prises murales","value":"12"},{"label":"Fenêtres","value":"1 — plein est"},{"label":"Plan de travail","value":"Granit adouci"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/kitchen5.jpg', 0 from room;
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('studio-one', 2, 'Bedroom', 'Chambre',
          '[{"label":"Dimensions","value":"4.6 × 3.9 m"},{"label":"Wall sockets","value":"6"},{"label":"Windows","value":"2 — north facing"},{"label":"Flooring","value":"Oak parquet"}]'::jsonb, '[{"label":"Dimensions","value":"4,6 × 3,9 m"},{"label":"Prises murales","value":"6"},{"label":"Fenêtres","value":"2 — plein nord"},{"label":"Sol","value":"Parquet en chêne"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/bedroom5.jpg', 0 from room;
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('studio-one', 3, 'Toilet', 'Salle d''eau',
          '[{"label":"Dimensions","value":"2.4 × 1.8 m"},{"label":"Wall sockets","value":"2"},{"label":"Ventilation","value":"Mechanical extract"},{"label":"Flooring","value":"Porcelain tile"}]'::jsonb, '[{"label":"Dimensions","value":"2,4 × 1,8 m"},{"label":"Prises murales","value":"2"},{"label":"Ventilation","value":"Extraction mécanique"},{"label":"Sol","value":"Grès cérame"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/toilet5.jpg', 0 from room;

-- terrace-suite
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('terrace-suite', 0, 'Parlour', 'Salon',
          '[{"label":"Dimensions","value":"6.2 × 4.8 m"},{"label":"Wall sockets","value":"8"},{"label":"Windows","value":"3 — south facing"},{"label":"Flooring","value":"Oak parquet"}]'::jsonb, '[{"label":"Dimensions","value":"6,2 × 4,8 m"},{"label":"Prises murales","value":"8"},{"label":"Fenêtres","value":"3 — plein sud"},{"label":"Sol","value":"Parquet en chêne"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/parlour1.jpg', 0 from room;
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('terrace-suite', 1, 'Kitchen', 'Cuisine',
          '[{"label":"Dimensions","value":"4.1 × 3.4 m"},{"label":"Wall sockets","value":"12"},{"label":"Windows","value":"1 — east facing"},{"label":"Worktop","value":"Honed granite"}]'::jsonb, '[{"label":"Dimensions","value":"4,1 × 3,4 m"},{"label":"Prises murales","value":"12"},{"label":"Fenêtres","value":"1 — plein est"},{"label":"Plan de travail","value":"Granit adouci"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/kitchen1.jpg', 0 from room;
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('terrace-suite', 2, 'Bedroom', 'Chambre',
          '[{"label":"Dimensions","value":"4.6 × 3.9 m"},{"label":"Wall sockets","value":"6"},{"label":"Windows","value":"2 — north facing"},{"label":"Flooring","value":"Oak parquet"}]'::jsonb, '[{"label":"Dimensions","value":"4,6 × 3,9 m"},{"label":"Prises murales","value":"6"},{"label":"Fenêtres","value":"2 — plein nord"},{"label":"Sol","value":"Parquet en chêne"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/bedroom1.jpg', 0 from room;
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('terrace-suite', 3, 'Toilet', 'Salle d''eau',
          '[{"label":"Dimensions","value":"2.4 × 1.8 m"},{"label":"Wall sockets","value":"2"},{"label":"Ventilation","value":"Mechanical extract"},{"label":"Flooring","value":"Porcelain tile"}]'::jsonb, '[{"label":"Dimensions","value":"2,4 × 1,8 m"},{"label":"Prises murales","value":"2"},{"label":"Ventilation","value":"Extraction mécanique"},{"label":"Sol","value":"Grès cérame"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/toilet1.jpg', 0 from room;

-- loft-duplex
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('loft-duplex', 0, 'Parlour', 'Salon',
          '[{"label":"Dimensions","value":"6.2 × 4.8 m"},{"label":"Wall sockets","value":"8"},{"label":"Windows","value":"3 — south facing"},{"label":"Flooring","value":"Oak parquet"}]'::jsonb, '[{"label":"Dimensions","value":"6,2 × 4,8 m"},{"label":"Prises murales","value":"8"},{"label":"Fenêtres","value":"3 — plein sud"},{"label":"Sol","value":"Parquet en chêne"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/parlour2.jpg', 0 from room;
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('loft-duplex', 1, 'Kitchen', 'Cuisine',
          '[{"label":"Dimensions","value":"4.1 × 3.4 m"},{"label":"Wall sockets","value":"12"},{"label":"Windows","value":"1 — east facing"},{"label":"Worktop","value":"Honed granite"}]'::jsonb, '[{"label":"Dimensions","value":"4,1 × 3,4 m"},{"label":"Prises murales","value":"12"},{"label":"Fenêtres","value":"1 — plein est"},{"label":"Plan de travail","value":"Granit adouci"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/kitchen2.jpg', 0 from room;
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('loft-duplex', 2, 'Bedroom', 'Chambre',
          '[{"label":"Dimensions","value":"4.6 × 3.9 m"},{"label":"Wall sockets","value":"6"},{"label":"Windows","value":"2 — north facing"},{"label":"Flooring","value":"Oak parquet"}]'::jsonb, '[{"label":"Dimensions","value":"4,6 × 3,9 m"},{"label":"Prises murales","value":"6"},{"label":"Fenêtres","value":"2 — plein nord"},{"label":"Sol","value":"Parquet en chêne"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/bedroom2.jpg', 0 from room;
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('loft-duplex', 3, 'Toilet', 'Salle d''eau',
          '[{"label":"Dimensions","value":"2.4 × 1.8 m"},{"label":"Wall sockets","value":"2"},{"label":"Ventilation","value":"Mechanical extract"},{"label":"Flooring","value":"Porcelain tile"}]'::jsonb, '[{"label":"Dimensions","value":"2,4 × 1,8 m"},{"label":"Prises murales","value":"2"},{"label":"Ventilation","value":"Extraction mécanique"},{"label":"Sol","value":"Grès cérame"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/toilet2.jpg', 0 from room;

-- poolside-villa
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('poolside-villa', 0, 'Parlour', 'Salon',
          '[{"label":"Dimensions","value":"6.2 × 4.8 m"},{"label":"Wall sockets","value":"8"},{"label":"Windows","value":"3 — south facing"},{"label":"Flooring","value":"Oak parquet"}]'::jsonb, '[{"label":"Dimensions","value":"6,2 × 4,8 m"},{"label":"Prises murales","value":"8"},{"label":"Fenêtres","value":"3 — plein sud"},{"label":"Sol","value":"Parquet en chêne"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/parlour3.jpg', 0 from room;
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('poolside-villa', 1, 'Kitchen', 'Cuisine',
          '[{"label":"Dimensions","value":"4.1 × 3.4 m"},{"label":"Wall sockets","value":"12"},{"label":"Windows","value":"1 — east facing"},{"label":"Worktop","value":"Honed granite"}]'::jsonb, '[{"label":"Dimensions","value":"4,1 × 3,4 m"},{"label":"Prises murales","value":"12"},{"label":"Fenêtres","value":"1 — plein est"},{"label":"Plan de travail","value":"Granit adouci"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/kitchen3.jpg', 0 from room;
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('poolside-villa', 2, 'Bedroom', 'Chambre',
          '[{"label":"Dimensions","value":"4.6 × 3.9 m"},{"label":"Wall sockets","value":"6"},{"label":"Windows","value":"2 — north facing"},{"label":"Flooring","value":"Oak parquet"}]'::jsonb, '[{"label":"Dimensions","value":"4,6 × 3,9 m"},{"label":"Prises murales","value":"6"},{"label":"Fenêtres","value":"2 — plein nord"},{"label":"Sol","value":"Parquet en chêne"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/bedroom3.jpg', 0 from room;
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('poolside-villa', 3, 'Toilet', 'Salle d''eau',
          '[{"label":"Dimensions","value":"2.4 × 1.8 m"},{"label":"Wall sockets","value":"2"},{"label":"Ventilation","value":"Mechanical extract"},{"label":"Flooring","value":"Porcelain tile"}]'::jsonb, '[{"label":"Dimensions","value":"2,4 × 1,8 m"},{"label":"Prises murales","value":"2"},{"label":"Ventilation","value":"Extraction mécanique"},{"label":"Sol","value":"Grès cérame"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/toilet3.jpg', 0 from room;

-- corner-residence
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('corner-residence', 0, 'Parlour', 'Salon',
          '[{"label":"Dimensions","value":"6.2 × 4.8 m"},{"label":"Wall sockets","value":"8"},{"label":"Windows","value":"3 — south facing"},{"label":"Flooring","value":"Oak parquet"}]'::jsonb, '[{"label":"Dimensions","value":"6,2 × 4,8 m"},{"label":"Prises murales","value":"8"},{"label":"Fenêtres","value":"3 — plein sud"},{"label":"Sol","value":"Parquet en chêne"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/parlour4.jpg', 0 from room;
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('corner-residence', 1, 'Kitchen', 'Cuisine',
          '[{"label":"Dimensions","value":"4.1 × 3.4 m"},{"label":"Wall sockets","value":"12"},{"label":"Windows","value":"1 — east facing"},{"label":"Worktop","value":"Honed granite"}]'::jsonb, '[{"label":"Dimensions","value":"4,1 × 3,4 m"},{"label":"Prises murales","value":"12"},{"label":"Fenêtres","value":"1 — plein est"},{"label":"Plan de travail","value":"Granit adouci"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/kitchen4.jpg', 0 from room;
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('corner-residence', 2, 'Bedroom', 'Chambre',
          '[{"label":"Dimensions","value":"4.6 × 3.9 m"},{"label":"Wall sockets","value":"6"},{"label":"Windows","value":"2 — north facing"},{"label":"Flooring","value":"Oak parquet"}]'::jsonb, '[{"label":"Dimensions","value":"4,6 × 3,9 m"},{"label":"Prises murales","value":"6"},{"label":"Fenêtres","value":"2 — plein nord"},{"label":"Sol","value":"Parquet en chêne"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/bedroom4.jpg', 0 from room;
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('corner-residence', 3, 'Toilet', 'Salle d''eau',
          '[{"label":"Dimensions","value":"2.4 × 1.8 m"},{"label":"Wall sockets","value":"2"},{"label":"Ventilation","value":"Mechanical extract"},{"label":"Flooring","value":"Porcelain tile"}]'::jsonb, '[{"label":"Dimensions","value":"2,4 × 1,8 m"},{"label":"Prises murales","value":"2"},{"label":"Ventilation","value":"Extraction mécanique"},{"label":"Sol","value":"Grès cérame"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/toilet4.jpg', 0 from room;

-- north-atelier
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('north-atelier', 0, 'Parlour', 'Salon',
          '[{"label":"Dimensions","value":"6.2 × 4.8 m"},{"label":"Wall sockets","value":"8"},{"label":"Windows","value":"3 — south facing"},{"label":"Flooring","value":"Oak parquet"}]'::jsonb, '[{"label":"Dimensions","value":"6,2 × 4,8 m"},{"label":"Prises murales","value":"8"},{"label":"Fenêtres","value":"3 — plein sud"},{"label":"Sol","value":"Parquet en chêne"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/parlour5.jpg', 0 from room;
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('north-atelier', 1, 'Kitchen', 'Cuisine',
          '[{"label":"Dimensions","value":"4.1 × 3.4 m"},{"label":"Wall sockets","value":"12"},{"label":"Windows","value":"1 — east facing"},{"label":"Worktop","value":"Honed granite"}]'::jsonb, '[{"label":"Dimensions","value":"4,1 × 3,4 m"},{"label":"Prises murales","value":"12"},{"label":"Fenêtres","value":"1 — plein est"},{"label":"Plan de travail","value":"Granit adouci"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/kitchen5.jpg', 0 from room;
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('north-atelier', 2, 'Bedroom', 'Chambre',
          '[{"label":"Dimensions","value":"4.6 × 3.9 m"},{"label":"Wall sockets","value":"6"},{"label":"Windows","value":"2 — north facing"},{"label":"Flooring","value":"Oak parquet"}]'::jsonb, '[{"label":"Dimensions","value":"4,6 × 3,9 m"},{"label":"Prises murales","value":"6"},{"label":"Fenêtres","value":"2 — plein nord"},{"label":"Sol","value":"Parquet en chêne"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/bedroom5.jpg', 0 from room;
with room as (
  insert into rooms (slug, position, name_en, name_fr, specs_en, specs_fr)
  values ('north-atelier', 3, 'Toilet', 'Salle d''eau',
          '[{"label":"Dimensions","value":"2.4 × 1.8 m"},{"label":"Wall sockets","value":"2"},{"label":"Ventilation","value":"Mechanical extract"},{"label":"Flooring","value":"Porcelain tile"}]'::jsonb, '[{"label":"Dimensions","value":"2,4 × 1,8 m"},{"label":"Prises murales","value":"2"},{"label":"Ventilation","value":"Extraction mécanique"},{"label":"Sol","value":"Grès cérame"}]'::jsonb)
  returning id
)
insert into room_images (room_id, url, position)
select id, '/toilet5.jpg', 0 from room;

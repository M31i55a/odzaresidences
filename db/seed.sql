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

/* Room photographs. There were only five sets for ten listings, so they
   cycled — set number was (index % 5) + 1. That repetition is preserved here
   so nothing changes on the day of the switch; the admin can replace any of
   them one at a time afterwards. */
insert into listing_rooms (slug, part, image_url)
select l.slug, p.part, '/' || p.part || s.n || '.jpg'
  from (values
          ('the-penthouse', 0), ('garden-villa', 1), ('skyline-apartment', 2),
          ('the-assembly', 3),  ('studio-one', 4),   ('terrace-suite', 5),
          ('loft-duplex', 6),   ('poolside-villa', 7),
          ('corner-residence', 8), ('north-atelier', 9)
       ) as l(slug, idx)
  cross join (values ('parlour'), ('kitchen'), ('bedroom'), ('toilet')) as p(part)
  cross join lateral (select (l.idx % 5) + 1 as n) as s
on conflict (slug, part) do update set image_url = excluded.image_url;

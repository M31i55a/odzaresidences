-- Odza schema. Run once against the Neon database, then db/seed.sql to load
-- the listings the site shipped with.
--
--   psql "$DATABASE_URL" -f db/schema.sql
--   psql "$DATABASE_URL" -f db/seed.sql
--
-- Everything is `if not exists`, so re-running is harmless.

-- ---------------------------------------------------------------- listings

create table if not exists listings (
  slug          text primary key,

  -- One unit of a stay: a night, or a day when per_day is true.
  price         integer not null check (price > 0),
  per_day       boolean not null default false,

  -- Rooms, or seats when seats is true (the conference hall).
  rooms         integer not null check (rooms > 0),
  seats         boolean not null default false,

  area          text not null,
  image_url     text not null,

  /* Copy lives per language on the row rather than in the dictionary: the
     admin can add a listing the code has never heard of, so a fixed key set
     in i18n stopped being possible the moment these became editable. */
  name_en       text not null,
  name_fr       text not null,
  kind_en       text not null,
  kind_fr       text not null,

  -- Display order on the site; the home strip takes the first few.
  position      integer not null default 0,
  -- Unpublished listings stay in the admin but leave the site.
  published     boolean not null default true,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists listings_order
  on listings (published, position, slug);

/* Free prose about the residence, in place of a row of structured facts —
   easier to write and it says more. Added as ALTERs rather than columns on
   the table above so that re-running this file migrates a database that has
   already been created, which is the whole point of everything here being
   `if not exists`. */
alter table listings add column if not exists description_en text not null default '';
alter table listings add column if not exists description_fr text not null default '';

-- ------------------------------------------------------------------- rooms

/* Rooms belong to a listing and are entirely the admin's: any number of them,
   named and described per language. They used to be four fixed parts pinned
   by a check constraint, with the names and specs living in the dictionary —
   which stopped being possible the moment the admin could add a residence the
   code has never heard of.

   An identity key rather than (slug, name): two rooms in one villa may
   legitimately both be called "Bedroom", and a room keeps its photographs
   when it is renamed. */
create table if not exists rooms (
  id          bigint generated always as identity primary key,
  slug        text not null references listings (slug) on delete cascade,

  -- Walkthrough order within the listing.
  position    integer not null default 0,

  name_en     text not null,
  name_fr     text not null,

  /* Descriptive ONLY — shown as a detail on the room, never used to price a
     booking. A stay is priced from listings.price; see quote() in
     components/reservation.ts, which never reads this. */
  price       integer check (price is null or price > 0),

  /* Free-form detail rows, per language: [{"label": "…", "value": "…"}, …].
     jsonb rather than another table because they are only ever read and
     written as a whole list, never queried across. */
  specs_en    jsonb not null default '[]'::jsonb,
  specs_fr    jsonb not null default '[]'::jsonb,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists rooms_by_listing
  on rooms (slug, position, id);

-- A room's gallery, in the order the admin arranged.
create table if not exists room_images (
  id        bigint generated always as identity primary key,
  room_id   bigint not null references rooms (id) on delete cascade,
  url       text not null,
  position  integer not null default 0
);

create index if not exists room_images_by_room
  on room_images (room_id, position, id);

-- ------------------------------------------------------------ reservations

create table if not exists reservations (
  /* The reference quoted to the customer and sent to Paymooney as item_ref,
     which is how a payment callback finds its way back to a booking. */
  reference           text primary key,

  /* Not a foreign key on purpose. A listing may be deleted or renamed later
     and the booking still has to make sense, so the details that mattered at
     the time are copied onto the row. */
  slug                text not null,
  listing_name        text not null,

  name                text not null,
  phone               text not null,
  email               text,
  locale              text not null default 'fr',

  arrival             date not null,
  departure           date not null,
  units               integer not null check (units > 0),
  guests              integer not null check (guests > 0),
  note                text,

  -- Whole XAF, priced by the server at the time of booking.
  rate                integer not null,
  total               integer not null,
  due                 integer not null,
  balance             integer not null,
  payment_choice      text not null check (payment_choice in ('deposit', 'full')),

  payment_status      text not null default 'pending'
                        check (payment_status in ('pending', 'paid', 'failed')),
  paid_amount         integer,
  paid_currency       text,
  operator            text,
  transaction_number  text,
  paid_at             timestamptz,

  created_at          timestamptz not null default now()
);

create index if not exists reservations_recent
  on reservations (created_at desc);

create index if not exists reservations_by_status
  on reservations (payment_status, created_at desc);

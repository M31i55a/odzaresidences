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

-- Room photographs, one per part per listing. The parts themselves and their
-- specs stay in the dictionary — only the pictures are editable.
create table if not exists listing_rooms (
  slug        text not null references listings (slug) on delete cascade,
  part        text not null check (part in ('parlour', 'kitchen', 'bedroom', 'toilet')),
  image_url   text not null,
  primary key (slug, part)
);

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

begin;

-- Server-side cache of Gemini-generated practice examples.
-- Only the Edge Function (service role) reads and writes this table.
create table if not exists public.c2c_concept_examples (
  cache_key text primary key check (cache_key ~ '^[0-9a-f]{64}$'),
  concept_ids bigint[] not null,
  examples jsonb not null check (jsonb_typeof(examples) = 'array' and jsonb_array_length(examples) = 3),
  model text not null,
  created_at timestamptz not null default now()
);

alter table public.c2c_concept_examples enable row level security;
revoke all on public.c2c_concept_examples from anon, authenticated;

commit;

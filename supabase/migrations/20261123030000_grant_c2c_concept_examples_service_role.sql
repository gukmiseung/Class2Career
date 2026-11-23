begin;

-- The Edge Function reads and writes the cache with the service role.
grant select, insert, update on public.c2c_concept_examples to service_role;

commit;

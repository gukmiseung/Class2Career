DO $migration$
BEGIN
  PERFORM set_config('lock_timeout', '5s', true);
  LOCK TABLE public.c2c_careers IN SHARE MODE;
  LOCK TABLE public.c2c_user_career_interests IN ACCESS EXCLUSIVE MODE;

  IF NOT EXISTS (
    SELECT FROM pg_constraint
    WHERE conrelid = 'public.c2c_user_career_interests'::regclass
      AND conname = 'c2c_user_career_interests_pkey'
      AND contype = 'p' AND pg_get_constraintdef(oid) = 'PRIMARY KEY (user_id)'
  ) OR EXISTS (
    SELECT FROM pg_attribute
    WHERE attrelid = 'public.c2c_user_career_interests'::regclass
      AND attname = 'career_slug' AND NOT attisdropped
  ) OR NOT EXISTS (
    SELECT FROM pg_trigger
    WHERE tgrelid = 'public.c2c_user_career_interests'::regclass
      AND tgname = 'c2c_career_interest_updated_at' AND tgenabled = 'O'
  ) THEN
    RAISE EXCEPTION 'Unexpected career interest schema; migration stopped.';
  END IF;

  IF EXISTS (
    SELECT FROM public.c2c_user_career_interests AS interest
    WHERE (SELECT count(*) FROM public.c2c_careers AS career
           WHERE career.title COLLATE "C" = interest.career_name COLLATE "C") <> 1
  ) THEN
    RAISE EXCEPTION 'Existing career interests do not have exactly one catalog match; migration stopped.';
  END IF;

  CREATE TEMP TABLE c2c_career_interest_before ON COMMIT DROP AS
    SELECT user_id, career_name, created_at, updated_at FROM public.c2c_user_career_interests;

  ALTER TABLE public.c2c_user_career_interests ADD COLUMN career_slug text;
  ALTER TABLE public.c2c_user_career_interests DISABLE TRIGGER c2c_career_interest_updated_at;

  UPDATE public.c2c_user_career_interests AS interest
  SET career_slug = career.slug
  FROM public.c2c_careers AS career
  WHERE career.title COLLATE "C" = interest.career_name COLLATE "C";

  ALTER TABLE public.c2c_user_career_interests ENABLE TRIGGER c2c_career_interest_updated_at;
  ALTER TABLE public.c2c_user_career_interests
    ALTER COLUMN career_slug SET NOT NULL,
    ADD CONSTRAINT c2c_user_career_interests_career_slug_fkey FOREIGN KEY (career_slug) REFERENCES public.c2c_careers(slug),
    DROP CONSTRAINT c2c_user_career_interests_pkey,
    ADD CONSTRAINT c2c_user_career_interests_pkey PRIMARY KEY (user_id, career_slug);

  IF (SELECT count(*) FROM public.c2c_user_career_interests) <>
     (SELECT count(*) FROM pg_temp.c2c_career_interest_before)
     OR EXISTS (
       SELECT user_id, career_name, created_at, updated_at FROM pg_temp.c2c_career_interest_before
       EXCEPT ALL
       SELECT user_id, career_name, created_at, updated_at FROM public.c2c_user_career_interests
     ) THEN
    RAISE EXCEPTION 'Existing career interest rows or timestamps changed; migration stopped.';
  END IF;
END;
$migration$;

NOTIFY pgrst, 'reload schema';

alter table public.c2c_user_courses
  drop constraint c2c_user_courses_status_check,
  add constraint c2c_user_courses_status_check
    check (status in ('completed', 'in_progress', 'planned'));

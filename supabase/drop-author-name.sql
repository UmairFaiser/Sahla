-- run this in the Supabase SQL editor
-- removes the reply name column now that only one person replies

drop policy if exists replies_insert_anon on public.replies;
drop policy if exists replies_insert_authenticated on public.replies;

alter table public.replies
  drop constraint if exists replies_author_length;

alter table public.replies
  drop column if exists author_name;

create policy replies_insert_anon
  on public.replies
  for insert
  to anon
  with check (char_length(body) between 1 and 4000);

create policy replies_insert_authenticated
  on public.replies
  for insert
  to authenticated
  with check (char_length(body) between 1 and 4000);

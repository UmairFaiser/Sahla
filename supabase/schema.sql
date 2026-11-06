-- purpose: blog post + highlight replies for sahla
-- tables: public.posts, public.replies
-- access: public read of posts; public read/insert of replies (site is gated in the app)

create table if not exists public.posts (
  id bigint generated always as identity primary key,
  slug text not null unique,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.replies (
  id bigint generated always as identity primary key,
  post_id bigint not null references public.posts (id) on delete cascade,
  body text not null,
  quoted_text text,
  start_offset integer,
  end_offset integer,
  created_at timestamptz not null default now(),
  constraint replies_body_length check (char_length(body) between 1 and 4000),
  constraint replies_quote_range check (
    (
      quoted_text is null
      and start_offset is null
      and end_offset is null
    )
    or (
      quoted_text is not null
      and start_offset is not null
      and end_offset is not null
      and start_offset >= 0
      and end_offset > start_offset
    )
  )
);

create index if not exists replies_post_id_created_at_idx
  on public.replies (post_id, created_at);

create index if not exists replies_post_id_offsets_idx
  on public.replies (post_id, start_offset, end_offset);

alter table public.posts enable row level security;
alter table public.replies enable row level security;

revoke all on table public.posts from anon, authenticated;
revoke all on table public.replies from anon, authenticated;

grant select on table public.posts to anon, authenticated;
grant select, insert on table public.replies to anon, authenticated;

drop policy if exists posts_select_anon on public.posts;
drop policy if exists posts_select_authenticated on public.posts;
drop policy if exists replies_select_anon on public.replies;
drop policy if exists replies_select_authenticated on public.replies;
drop policy if exists replies_insert_anon on public.replies;
drop policy if exists replies_insert_authenticated on public.replies;

create policy posts_select_anon
  on public.posts
  for select
  to anon
  using (true);

create policy posts_select_authenticated
  on public.posts
  for select
  to authenticated
  using (true);

create policy replies_select_anon
  on public.replies
  for select
  to anon
  using (true);

create policy replies_select_authenticated
  on public.replies
  for select
  to authenticated
  using (true);

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

insert into public.posts (slug, title, body)
values (
  'hello',
  'Leave a mark, not just a comment',
  $post$This is a quiet page on purpose.

You can read it the way you would a letter: slowly, and with a pencil nearby. If a sentence stops you, highlight it and reply to that line. If you would rather wait until the end, there is a place for that too.

The idea is simple. Most comment boxes sit at the bottom of a page and collect everything into one pile. Here, a reply can stay attached to the words that prompted it. The rest of the text can keep its own silence.

Write as yourself, or as no one in particular. Keep it kind. Keep it specific. If you are answering a highlighted sentence, answer that sentence. If you are answering the whole thing, say so in the box at the end.

That is all this site is. A piece of text, and the notes people leave in the margins.$post$
)
on conflict (slug) do update
set
  title = excluded.title,
  body = excluded.body;

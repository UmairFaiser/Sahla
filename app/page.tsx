import { connection } from "next/server";
import { Suspense } from "react";
import { Article } from "@/components/article";
import { Replies } from "@/components/replies";
import { ReplyForm } from "@/components/reply-form";
import { FALLBACK_POST } from "@/lib/content";
import { formatDay } from "@/lib/dates";
import type { Post, Reply } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default function Home() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Blog />
    </Suspense>
  );
}

async function Blog() {
  await connection();
  const supabase = createClient(await cookies());

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("id, slug, title, body, created_at")
    .eq("slug", "hello")
    .maybeSingle<Post>();

  const resolvedPost = post ?? FALLBACK_POST;
  const tablesMissing = Boolean(postError) || !post;

  const { data: replies, error: replyError } = tablesMissing
    ? { data: [] as Reply[], error: null }
    : await supabase
        .from("replies")
        .select(
          "id, post_id, author_name, body, quoted_text, start_offset, end_offset, created_at",
        )
        .eq("post_id", resolvedPost.id)
        .order("created_at", { ascending: true })
        .returns<Reply[]>();

  if (replyError) {
    return <ErrorState message={replyError.message} />;
  }

  const list = replies ?? [];

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16 sm:py-24">
      {tablesMissing ? (
        <p className="mt-6 rounded-2xl bg-amber-100 px-4 py-3 text-sm leading-6 text-gray-1200">
          Database is reachable, but the posts/replies tables are not created yet.
          Open the SQL editor for this project and run{" "}
          <code className="rounded-md bg-white px-1.5 py-0.5 font-mono text-[0.85em]">
            supabase/schema.sql
          </code>
          .
        </p>
      ) : null}
      <time
        dateTime={resolvedPost.created_at}
        className="mt-6 block text-sm text-gray-1100 tabular-nums"
      >
        {formatDay(resolvedPost.created_at)}
      </time>
      <h1 className="mt-3 font-serif text-4xl leading-[1.15] text-balance text-gray-1200 sm:text-5xl">
        {resolvedPost.title}
      </h1>
      <p className="mt-4 mb-10 text-sm text-gray-1100">
        Maybe this is the last message from me to you, perhaps i dont know...
        BTW you can reply to the whole message, or just a part of it by highlighting it.
      </p>
      <Article post={resolvedPost} replies={list} />

      <section className="mt-16 border-t border-gray-400 pt-10">
        <h2 className="font-serif text-2xl text-gray-1200 text-balance">
          Replies
        </h2>
        <div className="mt-6">
          <Replies replies={list} />
        </div>
        <div className="mt-10 rounded-[28px] bg-white p-5 shadow-custom">
          <p className="mb-4 text-sm text-gray-1100">You can type you replies here Sahla</p>
          <ReplyForm postId={resolvedPost.id} />
        </div>
      </section>
    </main>
  );
}

function PageSkeleton() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-24">
      <div className="h-3 w-16 rounded-full bg-gray-400" />
      <div className="mt-8 h-10 w-3/4 rounded-2xl bg-gray-300" />
      <div className="mt-8 space-y-3">
        <div className="h-4 w-full rounded-full bg-gray-300" />
        <div className="h-4 w-11/12 rounded-full bg-gray-300" />
        <div className="h-4 w-4/5 rounded-full bg-gray-300" />
      </div>
    </main>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <main className="mx-auto max-w-xl px-6 py-24">
      <h1 className="font-serif text-3xl text-gray-1200 text-balance">
        Couldn’t load the page
      </h1>
      <p className="mt-3 text-sm leading-6 text-gray-1100">{message}</p>
    </main>
  );
}

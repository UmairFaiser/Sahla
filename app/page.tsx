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

  let post: Post | null = null;
  let postError: { message: string } | null = null;
  let replies: Reply[] | null = null;
  let replyError: { message: string } | null = null;

  try {
    const supabase = createClient(await cookies());
    const postResult = await supabase
      .from("posts")
      .select("id, slug, title, body, created_at")
      .eq("slug", "hello")
      .maybeSingle<Post>();
    post = postResult.data;
    postError = postResult.error;
  } catch (error) {
    postError = {
      message: error instanceof Error ? error.message : "Database unavailable",
    };
  }

  const resolvedPost = post ?? FALLBACK_POST;
  const tablesMissing = Boolean(postError) || !post;

  if (!tablesMissing) {
    try {
      const supabase = createClient(await cookies());
      const replyResult = await supabase
        .from("replies")
        .select(
          "id, post_id, body, quoted_text, start_offset, end_offset, created_at",
        )
        .eq("post_id", resolvedPost.id)
        .order("created_at", { ascending: true })
        .returns<Reply[]>();
      replies = replyResult.data;
      replyError = replyResult.error;
    } catch (error) {
      replyError = {
        message: error instanceof Error ? error.message : "Database unavailable",
      };
    }
  }

  const list = replies ?? [];

  return (
    <main className="mx-auto w-full min-w-0 max-w-2xl overflow-x-clip px-4 py-12 sm:px-6 sm:py-24">
      {tablesMissing || replyError ? (
        <p className="mt-6 rounded-2xl bg-amber-100 px-4 py-3 text-sm leading-6 text-gray-1200">
          {replyError?.message ??
            "Database is reachable, but the posts/replies tables are not created yet."}
        </p>
      ) : null}
      <time
        dateTime={resolvedPost.created_at}
        className="mt-6 block text-sm text-gray-1100 tabular-nums"
      >
        {formatDay(resolvedPost.created_at)}
      </time>
      <h1 className="mt-3 font-serif text-[1.85rem] leading-[1.15] break-words text-balance text-gray-1200 sm:text-4xl md:text-5xl">
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
        <div className="mt-10 min-w-0 rounded-[28px] bg-white p-4 sm:p-5 shadow-custom">
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


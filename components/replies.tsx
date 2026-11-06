import { formatStamp } from "@/lib/dates";
import type { Reply } from "@/lib/types";

export function Replies({ replies }: { replies: Reply[] }) {
  if (replies.length === 0) {
    return (
      <p className="text-sm text-gray-1100">
        No replies yet. Highlight a sentence, or write one below.
      </p>
    );
  }

  return (
    <ol className="space-y-6">
      {replies.map((reply, index) => (
        <li
          key={reply.id}
          className="animate-[fadeInUp_240ms_cubic-bezier(0.2,0,0,1)_both]"
          style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
        >
          {reply.quoted_text ? (
            <blockquote className="mb-2 border-l-2 border-gray-700 pl-3 text-sm text-gray-1100 italic">
              {reply.quoted_text}
            </blockquote>
          ) : null}
          <p className="text-sm font-medium text-gray-1200">
            {reply.author_name}
            <time
              dateTime={reply.created_at}
              className="ml-2 font-normal text-gray-1000 tabular-nums"
            >
              {formatStamp(reply.created_at)}
            </time>
          </p>
          <p className="mt-1 text-[0.975rem] leading-7 text-pretty text-gray-1200">
            {reply.body}
          </p>
        </li>
      ))}
    </ol>
  );
}

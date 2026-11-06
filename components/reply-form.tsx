"use client";

import { useActionState, useEffect, useRef } from "react";
import { createReply, type ActionState } from "@/app/actions";

const initial: ActionState = {};

type ReplyFormProps = {
  postId: number;
  quotedText?: string | null;
  startOffset?: number | null;
  endOffset?: number | null;
  onPosted?: () => void;
  compact?: boolean;
  hideQuote?: boolean;
  autoFocus?: boolean;
};

export function ReplyForm({
  postId,
  quotedText,
  startOffset,
  endOffset,
  onPosted,
  compact = false,
  hideQuote = false,
  autoFocus = false,
}: ReplyFormProps) {
  const [state, action, pending] = useActionState(createReply, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error && formRef.current?.dataset.submitted === "1") {
      formRef.current.reset();
      formRef.current.dataset.submitted = "0";
      onPosted?.();
    }
  }, [pending, state.error, onPosted]);

  useEffect(() => {
    if (!autoFocus) return;
    const field = formRef.current?.querySelector("textarea");
    field?.focus();
  }, [autoFocus]);

  return (
    <form
      ref={formRef}
      action={action}
      onSubmit={(event) => {
        event.currentTarget.dataset.submitted = "1";
      }}
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="quotedText" value={quotedText ?? ""} />
      <input type="hidden" name="startOffset" value={startOffset ?? ""} />
      <input type="hidden" name="endOffset" value={endOffset ?? ""} />

      {quotedText && !hideQuote ? (
        <blockquote className="border-l-2 border-gray-700 pl-3 text-sm text-gray-1100 italic">
          {quotedText}
        </blockquote>
      ) : null}

      <textarea
        name="body"
        required
        rows={compact ? 3 : 5}
        maxLength={4000}
        autoFocus={autoFocus}
        placeholder={
          quotedText ? "Reply to this line…" : "Reply to the whole piece…"
        }
        className="w-full max-w-full resize-y rounded-xl bg-gray-200 px-3.5 py-3 text-sm leading-6 text-gray-1200 shadow-border outline-none transition-[box-shadow] duration-150 ease-[cubic-bezier(0.2,0,0,1)] placeholder:text-gray-900 focus:shadow-custom"
      />

      {state.error ? (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="h-10 min-w-28 rounded-xl bg-gray-1200 px-4 text-sm font-medium text-gray-100 transition-[transform,opacity] duration-150 ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.96] disabled:opacity-60"
        >
          {pending ? "Sending…" : "Reply"}
        </button>
      </div>
    </form>
  );
}

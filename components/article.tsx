"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ReplyForm } from "@/components/reply-form";
import { formatStamp } from "@/lib/dates";
import type { Post, Reply } from "@/lib/types";

type Anchor = {
  top: number;
  left: number;
  placeBelow: boolean;
  lineTop: number;
  lineBottom: number;
};

type SelectionTip = Anchor & {
  text: string;
  start: number;
  end: number;
  expanded: boolean;
};

type ViewTip = Anchor & {
  ids: number[];
  locked: boolean;
};

function coveringIds(start: number, end: number, replies: Reply[]) {
  return replies
    .filter(
      (reply) =>
        reply.start_offset != null &&
        reply.end_offset != null &&
        reply.start_offset < end &&
        reply.end_offset > start,
    )
    .map((reply) => reply.id);
}

function clampLeft(left: number) {
  return Math.min(Math.max(left, 24), window.innerWidth - 24);
}

function anchorFromRect(rect: DOMRect): Anchor {
  const placeBelow = rect.top < 280;
  return {
    top: placeBelow ? rect.bottom + 10 : rect.top - 10,
    left: clampLeft(rect.left + rect.width / 2),
    placeBelow,
    lineTop: rect.top,
    lineBottom: rect.bottom,
  };
}

export function Article({ post, replies }: { post: Post; replies: Reply[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number | null>(null);
  const [selection, setSelection] = useState<SelectionTip | null>(null);
  const [view, setView] = useState<ViewTip | null>(null);

  const highlightReplies = useMemo(
    () =>
      replies.filter(
        (reply) => reply.start_offset != null && reply.end_offset != null,
      ),
    [replies],
  );

  const clearHideTimer = () => {
    if (hideTimer.current != null) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };

  const closeViewIfUnlocked = useCallback(() => {
    clearHideTimer();
    hideTimer.current = window.setTimeout(() => {
      setView((current) => (current?.locked ? current : null));
    }, 160);
  }, []);

  const showView = useCallback((ids: number[], rect: DOMRect, locked: boolean) => {
    clearHideTimer();
    setSelection(null);
    setView({
      ids,
      locked,
      ...anchorFromRect(rect),
    });
  }, []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest("[data-selection-ui]")) return;
      if (target.closest("[data-view-ui]")) return;
      if (target.closest("mark[data-highlight]")) return;
      setSelection(null);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => () => clearHideTimer(), []);

  useLayoutEffect(() => {
    const node = selectionRef.current;
    if (!node || !selection?.expanded || selection.placeBelow) return;
    if (node.getBoundingClientRect().top < 12) {
      setSelection((current) =>
        current
          ? {
              ...current,
              placeBelow: true,
              top: current.lineBottom + 10,
            }
          : current,
      );
    }
  }, [selection?.expanded, selection?.placeBelow]);

  useLayoutEffect(() => {
    const node = viewRef.current;
    if (!node || !view || view.placeBelow) return;
    if (node.getBoundingClientRect().top < 12) {
      setView((current) =>
        current
          ? {
              ...current,
              placeBelow: true,
              top: current.lineBottom + 10,
            }
          : current,
      );
    }
  }, [view]);

  const onMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest("mark[data-highlight]")) return;

    const root = rootRef.current;
    const sel = window.getSelection();
    if (!root || !sel || sel.isCollapsed || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    if (!root.contains(range.commonAncestorContainer)) return;

    const pre = document.createRange();
    pre.selectNodeContents(root);
    pre.setEnd(range.startContainer, range.startOffset);
    const start = pre.toString().length;
    const raw = range.toString();
    const text = raw.replace(/\s+/g, " ").trim();
    if (text.length < 2) return;

    setView(null);
    setSelection({
      text,
      start,
      end: start + raw.length,
      expanded: false,
      ...anchorFromRect(range.getBoundingClientRect()),
    });
  };

  const viewReplies = view
    ? replies.filter((reply) => view.ids.includes(reply.id))
    : [];

  return (
    <div className="relative">
      <div
        ref={rootRef}
        onMouseUp={onMouseUp}
        className="article-body whitespace-pre-wrap text-[1.125rem] tracking-tight leading-8 text-pretty text-gray-paragraph"
      >
        <MarkedText
          text={post.body}
          start={0}
          replies={highlightReplies}
          lockedIds={view?.locked ? view.ids : null}
          onHover={(ids, rect) => {
            if (view?.locked) return;
            showView(ids, rect, false);
          }}
          onLeave={() => {
            if (view?.locked) return;
            closeViewIfUnlocked();
          }}
          onLock={(ids, rect) => showView(ids, rect, true)}
        />
      </div>

      {selection ? (
        <div
          ref={selectionRef}
          data-selection-ui
          className="highlight-tooltip"
          data-expanded={selection.expanded ? "true" : "false"}
          data-below={selection.placeBelow ? "true" : "false"}
          style={{ top: selection.top, left: selection.left }}
        >
          <button
            type="button"
            className="highlight-tooltip-trigger"
            tabIndex={selection.expanded ? -1 : 0}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() =>
              setSelection((current) =>
                current ? { ...current, expanded: true } : current,
              )
            }
          >
            Reply
          </button>
          <div
            className="highlight-tooltip-composer"
            inert={selection.expanded ? undefined : true}
          >
            <div className="min-h-0 overflow-hidden">
              <ReplyForm
                postId={post.id}
                quotedText={selection.text}
                startOffset={selection.start}
                endOffset={selection.end}
                compact
                hideQuote
                autoFocus={selection.expanded}
                onPosted={() => setSelection(null)}
              />
            </div>
          </div>
        </div>
      ) : null}

      {view ? (
        <div
          ref={viewRef}
          data-view-ui
          className="view-tooltip"
          data-locked={view.locked ? "true" : "false"}
          data-below={view.placeBelow ? "true" : "false"}
          style={{ top: view.top, left: view.left }}
          onPointerEnter={clearHideTimer}
          onPointerLeave={() => {
            if (!view.locked) closeViewIfUnlocked();
          }}
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-medium tracking-[0.12em] text-gray-1100 uppercase">
              On this line
            </p>
            {view.locked ? (
              <button
                type="button"
                aria-label="Close"
                onClick={() => setView(null)}
                className="relative grid size-10 place-items-center rounded-full text-gray-1100 transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-gray-300 active:scale-[0.96]"
              >
                <span className="pointer-events-none absolute inset-0" />
                <CloseIcon />
              </button>
            ) : null}
          </div>
          <ul className="max-h-64 space-y-3 overflow-y-auto pr-1">
            {viewReplies.map((item) => (
              <li key={item.id} className="space-y-1">
                <p className="text-sm font-medium text-gray-1200">
                  {item.author_name}
                  <span className="ml-2 font-normal text-gray-1000 tabular-nums">
                    {formatStamp(item.created_at)}
                  </span>
                </p>
                <p className="text-sm leading-6 text-pretty text-gray-1100">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function MarkedText({
  text,
  start,
  replies,
  lockedIds,
  onHover,
  onLeave,
  onLock,
}: {
  text: string;
  start: number;
  replies: Reply[];
  lockedIds: number[] | null;
  onHover: (ids: number[], rect: DOMRect) => void;
  onLeave: () => void;
  onLock: (ids: number[], rect: DOMRect) => void;
}) {
  const points = new Set([0, text.length]);

  for (const reply of replies) {
    if (reply.start_offset == null || reply.end_offset == null) continue;
    const localStart = Math.max(0, reply.start_offset - start);
    const localEnd = Math.min(text.length, reply.end_offset - start);
    if (localEnd <= 0 || localStart >= text.length) continue;
    points.add(localStart);
    points.add(localEnd);
  }

  const sorted = [...points].sort((a, b) => a - b);
  const nodes = [];

  for (let i = 0; i < sorted.length - 1; i += 1) {
    const from = sorted[i];
    const to = sorted[i + 1];
    const chunk = text.slice(from, to);
    if (!chunk) continue;

    const ids = coveringIds(start + from, start + to, replies);
    if (ids.length === 0) {
      nodes.push(<span key={from}>{chunk}</span>);
      continue;
    }

    const locked = lockedIds != null && ids.some((id) => lockedIds.includes(id));
    nodes.push(
      <mark
        key={from}
        data-highlight=""
        data-active={locked ? "true" : "false"}
        className="cursor-pointer rounded-[4px] bg-amber-200/70 text-inherit decoration-transparent transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] data-[active=true]:bg-amber-300/90"
        onPointerEnter={(event) =>
          onHover(ids, event.currentTarget.getBoundingClientRect())
        }
        onPointerLeave={onLeave}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onLock(ids, event.currentTarget.getBoundingClientRect());
        }}
      >
        {chunk}
      </mark>,
    );
  }

  return <>{nodes}</>;
}

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path
        d="M2.2 2.2l7.6 7.6M9.8 2.2l-7.6 7.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

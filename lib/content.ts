import type { Post } from "@/lib/types";

export const FALLBACK_POST: Post = {
  id: 0,
  slug: "hello",
  title: "Leave a mark, not just a comment",
  body: `This is a quiet page on purpose.

You can read it the way you would a letter: slowly, and with a pencil nearby. If a sentence stops you, highlight it and reply to that line. If you would rather wait until the end, there is a place for that too.

The idea is simple. Most comment boxes sit at the bottom of a page and collect everything into one pile. Here, a reply can stay attached to the words that prompted it. The rest of the text can keep its own silence.

Write as yourself, or as no one in particular. Keep it kind. Keep it specific. If you are answering a highlighted sentence, answer that sentence. If you are answering the whole thing, say so in the box at the end.

That is all this site is. A piece of text, and the notes people leave in the margins.`,
  created_at: "2026-11-06T00:00:00.000Z",
};

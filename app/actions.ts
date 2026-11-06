"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  COOKIE_NAME,
  createGateToken,
  expectedDob,
  isValidGateToken,
  normalizeDob,
} from "@/lib/gate";
import { createClient } from "@/utils/supabase/server";

export type ActionState = {
  error?: string;
};

async function requireGate() {
  const cookieStore = await cookies();
  const ok = await isValidGateToken(cookieStore.get(COOKIE_NAME)?.value);
  if (!ok) {
    redirect("/enter");
  }
  return cookieStore;
}

export async function unlockSite(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const day = String(formData.get("day") ?? "");
  const month = String(formData.get("month") ?? "");
  const year = String(formData.get("year") ?? "");
  const submitted = normalizeDob(`${day}.${month}.${year}`);

  if (submitted !== expectedDob()) {
    return { error: "That is not my date of birth. Seriously Sahla? You dont remember my DOB?" };
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, await createGateToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  redirect("/");
}

export async function createReply(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const cookieStore = await requireGate();
  const postId = Number(formData.get("postId"));
  const body = String(formData.get("body") ?? "").trim();
  const authorName = String(formData.get("authorName") ?? "").trim() || "Anonymous";
  const quotedText = String(formData.get("quotedText") ?? "").trim();
  const startRaw = String(formData.get("startOffset") ?? "");
  const endRaw = String(formData.get("endOffset") ?? "");

  if (!Number.isFinite(postId) || postId <= 0) {
    return { error: "Missing post." };
  }

  if (body.length < 1 || body.length > 4000) {
    return { error: "Write a reply between 1 and 4,000 characters." };
  }

  if (authorName.length > 80) {
    return { error: "Name is too long." };
  }

  const startOffset = startRaw ? Number(startRaw) : null;
  const endOffset = endRaw ? Number(endRaw) : null;
  const hasQuote =
    quotedText.length > 0 &&
    startOffset !== null &&
    endOffset !== null &&
    Number.isFinite(startOffset) &&
    Number.isFinite(endOffset) &&
    endOffset > startOffset;

  const supabase = createClient(cookieStore);
  const { error } = await supabase.from("replies").insert({
    post_id: postId,
    author_name: authorName,
    body,
    quoted_text: hasQuote ? quotedText : null,
    start_offset: hasQuote ? startOffset : null,
    end_offset: hasQuote ? endOffset : null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return {};
}

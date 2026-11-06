export function supabaseEnv() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    "https://hcnbgatyonwmsimjcmod.supabase.co";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    "sb_publishable_KbYNSw9YhEpox2fkIyTpcQ_RFkzHYSP";

  return { url, key };
}

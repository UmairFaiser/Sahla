const encoder = new TextEncoder();
const COOKIE_NAME = "sahla_gate";
const GATE_PAYLOAD = "sahla-access";

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(value: string) {
  const secret = process.env.GATE_SECRET;
  if (!secret) {
    throw new Error("Missing GATE_SECRET");
  }

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(value),
  );

  return toHex(signature);
}

export function expectedDob() {
  return process.env.GATE_DOB ?? "18.12.2007";
}

export function normalizeDob(raw: string) {
  const trimmed = raw.trim();
  const dotted = trimmed.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (dotted) {
    const day = dotted[1].padStart(2, "0");
    const month = dotted[2].padStart(2, "0");
    return `${day}.${month}.${dotted[3]}`;
  }

  const iso = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) {
    const day = iso[3].padStart(2, "0");
    const month = iso[2].padStart(2, "0");
    return `${day}.${month}.${iso[1]}`;
  }

  return trimmed;
}

export async function createGateToken() {
  return hmac(GATE_PAYLOAD);
}

export async function isValidGateToken(token: string | undefined) {
  if (!token) return false;
  return token === (await createGateToken());
}

export { COOKIE_NAME };

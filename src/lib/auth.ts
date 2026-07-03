// Edge-safe session token helpers (Web Crypto only) so they can be
// used from both the proxy (edge) and server actions (node).
export const SESSION_COOKIE = "norfu_admin_session";

const encoder = new TextEncoder();

export async function sessionToken(): Promise<string> {
  const secret = process.env.AUTH_SECRET;
  const password = process.env.ADMIN_PASSWORD;
  if (!secret || !password) {
    throw new Error("AUTH_SECRET and ADMIN_PASSWORD must be set");
  }
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(password)
  );
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

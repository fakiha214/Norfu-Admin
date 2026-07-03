import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, sessionToken } from "@/lib/auth";

// Defense in depth: every server action calls this even though the
// proxy already gates all routes.
export async function requireAdmin() {
  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE)?.value;
  if (!cookie || cookie !== (await sessionToken())) {
    redirect("/login");
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { banners } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-server";

export async function updateBanner(formData: FormData) {
  await requireAdmin();
  const str = (key: string) => String(formData.get(key) ?? "").trim();
  const id = Number(str("id"));
  if (!id) return;

  await db
    .update(banners)
    .set({
      kicker: str("kicker"),
      title: str("title"),
      copy: str("copy"),
      ctaLabel: str("ctaLabel"),
      href: str("href") || "/",
      imageUrl: str("imageUrl"),
      isActive: formData.get("isActive") === "on",
      updatedAt: new Date(),
    })
    .where(eq(banners.id, id));

  revalidatePath("/banners");
}

"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-server";

export async function saveSettings(formData: FormData) {
  await requireAdmin();
  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string" || key.startsWith("$")) continue;
    await db
      .insert(settings)
      .values({ key, value: value.trim() })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: value.trim() },
      });
  }
  revalidatePath("/settings");
}

"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { announcements } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-server";

export async function addAnnouncement(formData: FormData) {
  await requireAdmin();
  const message = String(formData.get("message") ?? "").trim();
  const sortOrder = Math.round(Number(formData.get("sortOrder")) || 0);
  if (message) {
    await db.insert(announcements).values({ message, sortOrder, isActive: true });
  }
  revalidatePath("/announcements");
}

export async function deleteAnnouncement(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (id) await db.delete(announcements).where(eq(announcements.id, id));
  revalidatePath("/announcements");
}

export async function setAnnouncementActive(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const next = formData.get("next") === "true";
  if (id) {
    await db
      .update(announcements)
      .set({ isActive: next })
      .where(eq(announcements.id, id));
  }
  revalidatePath("/announcements");
}

"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-server";

export async function deleteSubscriber(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (id) await db.delete(subscribers).where(eq(subscribers.id, id));
  revalidatePath("/subscribers");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-server";

// Slugs the storefront uses for its virtual collections — a category may not
// take one of these or it would shadow the New In / Sale pages.
const RESERVED_SLUGS = new Set(["new-in", "sale", "all"]);

function slugify(raw: string) {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Resolve the parent id from the form, validating that the target is a real
// top-level category (we allow a single level of nesting only).
async function resolveParentId(
  raw: string,
  selfId: number | null
): Promise<number | null | "invalid"> {
  if (!raw) return null;
  const parentId = Number(raw);
  if (!Number.isInteger(parentId)) return "invalid";
  if (selfId !== null && parentId === selfId) return "invalid";
  const parent = (
    await db.select().from(categories).where(eq(categories.id, parentId)).limit(1)
  )[0];
  if (!parent) return "invalid";
  // The chosen parent must itself be top-level (no grandchildren allowed).
  if (parent.parentId !== null) return "invalid";
  return parentId;
}

export async function saveCategory(formData: FormData) {
  await requireAdmin();
  const str = (key: string) => String(formData.get(key) ?? "").trim();
  const id = str("id") ? Number(str("id")) : null;

  const name = str("name");
  const slug = slugify(str("slug") || name);
  const back = id ? `/categories/${id}` : "/categories/new";

  if (!name || !slug) redirect(`${back}?error=missing`);
  if (RESERVED_SLUGS.has(slug)) redirect(`${back}?error=reserved`);

  // If this category already has children, it must remain top-level.
  let hasChildren = false;
  if (id) {
    const kids = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.parentId, id))
      .limit(1);
    hasChildren = kids.length > 0;
  }

  const parent = await resolveParentId(str("parentId"), id);
  if (parent === "invalid" || (hasChildren && parent !== null)) {
    redirect(`${back}?error=parent`);
  }

  const values = {
    slug,
    name,
    parentId: parent,
    imageUrl: str("imageUrl"),
    sortOrder: Math.round(Number(str("sortOrder")) || 0),
    isActive: formData.get("isActive") === "on",
    updatedAt: new Date(),
  };

  if (id) {
    await db.update(categories).set(values).where(eq(categories.id, id));
  } else {
    const inserted = await db
      .insert(categories)
      .values(values)
      .onConflictDoNothing()
      .returning({ id: categories.id });
    if (inserted.length === 0) redirect("/categories/new?error=slug-taken");
  }

  revalidatePath("/categories");
  redirect("/categories");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  // Sub-categories cascade-delete with their parent; products fall back to
  // uncategorised (category_id set null) via the FK.
  if (id) await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/categories");
}

export async function setCategoryActive(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const next = formData.get("next") === "true";
  if (id) {
    await db
      .update(categories)
      .set({ isActive: next, updatedAt: new Date() })
      .where(eq(categories.id, id));
  }
  revalidatePath("/categories");
}

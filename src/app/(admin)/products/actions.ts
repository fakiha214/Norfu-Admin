"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-server";

function parseColors(raw: string) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, hex] = line.split("|").map((s) => s.trim());
      return { name: name || "Colour", hex: hex || "#cccccc" };
    });
}

export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const str = (key: string) => String(formData.get(key) ?? "").trim();
  const id = str("id") ? Number(str("id")) : null;
  const gender = str("gender");
  const badge = str("badge");

  const values = {
    slug: str("slug").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
    name: str("name"),
    category: str("category").toLowerCase(),
    gender: (["men", "women", "juniors"].includes(gender) ? gender : "men") as
      | "men"
      | "women"
      | "juniors",
    fit: str("fit"),
    price: Math.max(0, Math.round(Number(str("price")) || 0)),
    salePrice: str("salePrice")
      ? Math.max(0, Math.round(Number(str("salePrice"))))
      : null,
    badge: badge === "sale" || badge === "new" ? (badge as "sale" | "new") : null,
    description: str("description"),
    sizes: str("sizes").split(",").map((s) => s.trim()).filter(Boolean),
    colors: parseColors(String(formData.get("colors") ?? "")),
    imageA: str("imageA"),
    imageB: str("imageB") || str("imageA"),
    isActive: formData.get("isActive") === "on",
    sortOrder: Math.round(Number(str("sortOrder")) || 0),
    updatedAt: new Date(),
  };

  if (!values.slug || !values.name || !values.imageA) {
    redirect(id ? `/products/${id}?error=missing` : "/products/new?error=missing");
  }

  if (id) {
    await db.update(products).set(values).where(eq(products.id, id));
  } else {
    await db.insert(products).values(values).onConflictDoNothing();
  }
  revalidatePath("/products");
  redirect("/products");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (id) await db.delete(products).where(eq(products.id, id));
  revalidatePath("/products");
}

export async function setProductActive(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const next = formData.get("next") === "true";
  if (id) {
    await db
      .update(products)
      .set({ isActive: next, updatedAt: new Date() })
      .where(eq(products.id, id));
  }
  revalidatePath("/products");
}

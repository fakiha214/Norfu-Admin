"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, notInArray } from "drizzle-orm";
import { db } from "@/db";
import { products, productSizes } from "@/db/schema";
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

// One size per line: "M | 12" (size | stock). "M" alone means stock 0.
function parseSizes(raw: string) {
  const seen = new Set<string>();
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [size, stock] = line.split("|").map((s) => s.trim());
      return {
        size: (size || "").slice(0, 20),
        stock: Math.max(0, Math.min(100000, Math.round(Number(stock)) || 0)),
      };
    })
    .filter((s) => {
      if (!s.size || seen.has(s.size)) return false;
      seen.add(s.size);
      return true;
    });
}

async function syncSizes(
  productId: number,
  sizes: { size: string; stock: number }[]
) {
  if (sizes.length === 0) {
    await db.delete(productSizes).where(eq(productSizes.productId, productId));
    return;
  }
  await db.delete(productSizes).where(
    and(
      eq(productSizes.productId, productId),
      notInArray(productSizes.size, sizes.map((s) => s.size))
    )
  );
  for (const [i, s] of sizes.entries()) {
    await db
      .insert(productSizes)
      .values({ productId, size: s.size, stock: s.stock, sortOrder: i })
      .onConflictDoUpdate({
        target: [productSizes.productId, productSizes.size],
        set: { stock: s.stock, sortOrder: i },
      });
  }
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
    colors: parseColors(String(formData.get("colors") ?? "")),
    imageA: str("imageA"),
    imageB: str("imageB") || str("imageA"),
    isActive: formData.get("isActive") === "on",
    sortOrder: Math.round(Number(str("sortOrder")) || 0),
    updatedAt: new Date(),
  };
  // A sale price at or above the regular price is a data-entry mistake.
  if (values.salePrice !== null && values.salePrice >= values.price) {
    values.salePrice = null;
  }
  const sizes = parseSizes(String(formData.get("sizes") ?? ""));

  if (!values.slug || !values.name || !values.imageA) {
    redirect(id ? `/products/${id}?error=missing` : "/products/new?error=missing");
  }

  let productId = id;
  if (id) {
    await db.update(products).set(values).where(eq(products.id, id));
  } else {
    const inserted = await db
      .insert(products)
      .values(values)
      .onConflictDoNothing()
      .returning({ id: products.id });
    if (inserted.length === 0) {
      redirect("/products/new?error=slug-taken");
    }
    productId = inserted[0].id;
  }
  if (productId) await syncSizes(productId, sizes);

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

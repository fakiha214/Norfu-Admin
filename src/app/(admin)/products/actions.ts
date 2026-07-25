"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, notInArray } from "drizzle-orm";
import { db } from "@/db";
import { categories, products, productSizes } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-server";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

// Common apparel colours, used to auto-name a swatch when the user picks a
// colour but doesn't type a name (previously such colours were silently
// dropped, which is why colours weren't saving).
const NAMED_COLORS: [string, string][] = [
  ["Black", "#000000"], ["White", "#ffffff"], ["Grey", "#808080"],
  ["Charcoal", "#36454f"], ["Navy", "#1f2a44"], ["Blue", "#2b5baa"],
  ["Sky", "#7ec8e3"], ["Red", "#c0392b"], ["Maroon", "#800000"],
  ["Pink", "#e79ed2"], ["Green", "#3b7a57"], ["Olive", "#708238"],
  ["Beige", "#d8cfc0"], ["Cream", "#fffdd0"], ["Brown", "#6f4e37"],
  ["Tan", "#d2b48c"], ["Yellow", "#f4c430"], ["Orange", "#e67e22"],
  ["Purple", "#6c3483"], ["Teal", "#2aa198"],
];

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function nearestColorName(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  let best = "Colour";
  let bestDist = Infinity;
  for (const [name, ref] of NAMED_COLORS) {
    const [rr, rg, rb] = hexToRgb(ref);
    const d = (r - rr) ** 2 + (g - rg) ** 2 + (b - rb) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = name;
    }
  }
  return best;
}

// "Name | #hex" per line. A name-less line ("| #hex", produced when the user
// only picks a swatch) is kept and auto-named from the hex, so colours are no
// longer discarded just because a name wasn't typed.
function parseColors(raw: string) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [rawName, rawHex] = line.split("|").map((s) => s.trim());
      const hex = HEX_RE.test(rawHex || "") ? rawHex : "#cccccc";
      const name = rawName || nearestColorName(hex);
      return { name: name.slice(0, 40), hex };
    })
    .filter((c) => c.name);
}

// One image URL per line; keep order, drop blanks, cap at 8.
function parseImages(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8);
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

// Validate the submitted category id against the categories table; anything
// missing/invalid falls back to uncategorised (null).
async function resolveCategoryId(raw: string): Promise<number | null> {
  if (!raw) return null;
  const categoryId = Number(raw);
  if (!Number.isInteger(categoryId)) return null;
  const found = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1);
  return found.length > 0 ? categoryId : null;
}

export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const str = (key: string) => String(formData.get(key) ?? "").trim();
  const id = str("id") ? Number(str("id")) : null;
  const badge = str("badge");

  const values = {
    slug: str("slug").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
    name: str("name"),
    categoryId: await resolveCategoryId(str("categoryId")),
    fit: str("fit"),
    price: Math.max(0, Math.round(Number(str("price")) || 0)),
    salePrice: str("salePrice")
      ? Math.max(0, Math.round(Number(str("salePrice"))))
      : null,
    badge: badge === "sale" || badge === "new" ? (badge as "sale" | "new") : null,
    description: str("description"),
    colors: parseColors(String(formData.get("colors") ?? "")),
    images: parseImages(String(formData.get("images") ?? "")),
    showSizeChart: formData.get("showSizeChart") === "on",
    isActive: formData.get("isActive") === "on",
    sortOrder: Math.round(Number(str("sortOrder")) || 0),
    updatedAt: new Date(),
  };
  // A sale price at or above the regular price is a data-entry mistake.
  if (values.salePrice !== null && values.salePrice >= values.price) {
    values.salePrice = null;
  }
  const sizes = parseSizes(String(formData.get("sizes") ?? ""));

  if (!values.slug || !values.name || values.images.length === 0) {
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

import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products, productSizes } from "@/db/schema";
import ProductForm from "../product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  const rows = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  const product = rows[0];
  if (!product) notFound();

  const sizes = await db
    .select()
    .from(productSizes)
    .where(eq(productSizes.productId, productId))
    .orderBy(asc(productSizes.sortOrder), asc(productSizes.id));

  return (
    <div>
      <h1 className="text-2xl font-bold">Edit — {product.name}</h1>
      <ProductForm product={product} sizes={sizes} error={error} />
    </div>
  );
}

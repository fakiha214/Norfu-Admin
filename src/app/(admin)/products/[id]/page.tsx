import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
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
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.id, Number(id)))
    .limit(1);
  const product = rows[0];
  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold">Edit — {product.name}</h1>
      <ProductForm product={product} error={error} />
    </div>
  );
}

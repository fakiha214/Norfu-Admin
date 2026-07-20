import { asc } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import ProductForm from "../product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const cats = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
  return (
    <div>
      <h1 className="text-2xl font-bold">Add product</h1>
      <ProductForm categories={cats} error={error} />
    </div>
  );
}

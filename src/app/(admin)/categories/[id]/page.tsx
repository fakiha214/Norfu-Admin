import { notFound } from "next/navigation";
import { eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import CategoryForm from "../category-form";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const categoryId = Number(id);
  if (!Number.isInteger(categoryId)) notFound();

  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1);
  const category = rows[0];
  if (!category) notFound();

  const parents = await db
    .select()
    .from(categories)
    .where(isNull(categories.parentId))
    .orderBy(categories.sortOrder);

  return (
    <div>
      <h1 className="text-2xl font-bold">Edit — {category.name}</h1>
      <CategoryForm category={category} parents={parents} error={error} />
    </div>
  );
}

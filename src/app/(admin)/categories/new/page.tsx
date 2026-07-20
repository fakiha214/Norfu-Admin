import { isNull } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import CategoryForm from "../category-form";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; parent?: string }>;
}) {
  const { error, parent } = await searchParams;
  const parents = await db
    .select()
    .from(categories)
    .where(isNull(categories.parentId))
    .orderBy(categories.sortOrder);

  // Preselect a parent when arriving from "Add sub-category".
  const preselectParent = parent ? Number(parent) : null;
  const defaultParentId =
    preselectParent && parents.some((p) => p.id === preselectParent)
      ? preselectParent
      : undefined;

  return (
    <div>
      <h1 className="text-2xl font-bold">Add category</h1>
      <CategoryForm
        parents={parents}
        error={error}
        defaultParentId={defaultParentId}
      />
    </div>
  );
}

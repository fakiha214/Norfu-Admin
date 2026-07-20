import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { deleteCategory, setCategoryActive } from "./actions";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const rows = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name));

  // Product counts per category (to warn before deleting).
  const prodRows = await db
    .select({ categoryId: products.categoryId })
    .from(products);
  const countByCat = new Map<number, number>();
  for (const p of prodRows) {
    if (p.categoryId !== null) {
      countByCat.set(p.categoryId, (countByCat.get(p.categoryId) ?? 0) + 1);
    }
  }

  const tops = rows.filter((c) => c.parentId === null);
  const childrenOf = (id: number) => rows.filter((c) => c.parentId === id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="mt-1 text-sm text-slate-500">
            {tops.length} top-level · {rows.length - tops.length} sub-categories.
            These build the storefront menu, homepage tiles and collection pages.
          </p>
        </div>
        <Link
          href="/categories/new"
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:opacity-90"
        >
          + Add category
        </Link>
      </div>

      {tops.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          No categories yet. Add your first top-level category (e.g. “T-Shirts”,
          “Shirts”, “Bottoms”) to start building the menu.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {tops.map((top) => (
            <div
              key={top.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <CategoryRowLine
                cat={top}
                count={countByCat.get(top.id) ?? 0}
                isTop
              />
              {childrenOf(top.id).map((child) => (
                <div key={child.id} className="border-t border-slate-100 pl-8">
                  <CategoryRowLine
                    cat={child}
                    count={countByCat.get(child.id) ?? 0}
                  />
                </div>
              ))}
              <div className="border-t border-slate-100 bg-slate-50 px-5 py-2">
                <Link
                  href={`/categories/new?parent=${top.id}`}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                  + Add sub-category to {top.name}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryRowLine({
  cat,
  count,
  isTop = false,
}: {
  cat: typeof categories.$inferSelect;
  count: number;
  isTop?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3">
      <div className="flex items-center gap-3">
        {cat.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cat.imageUrl}
            alt=""
            className="h-10 w-10 rounded object-cover bg-slate-100"
          />
        ) : (
          <div className="h-10 w-10 rounded bg-slate-100" />
        )}
        <div>
          <p className={isTop ? "font-semibold" : "font-medium text-slate-700"}>
            {cat.name}
          </p>
          <p className="text-xs text-slate-400">
            /{cat.slug} · {count} {count === 1 ? "product" : "products"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <form action={setCategoryActive}>
          <input type="hidden" name="id" value={cat.id} />
          <input type="hidden" name="next" value={String(!cat.isActive)} />
          <button
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              cat.isActive
                ? "bg-green-100 text-green-700"
                : "bg-slate-200 text-slate-500"
            }`}
            title="Click to toggle"
          >
            {cat.isActive ? "Active" : "Hidden"}
          </button>
        </form>
        <Link
          href={`/categories/${cat.id}`}
          className="rounded border border-slate-300 px-3 py-1 text-xs font-semibold hover:border-slate-900"
        >
          Edit
        </Link>
        <form action={deleteCategory}>
          <input type="hidden" name="id" value={cat.id} />
          <button
            className="rounded border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
            title={
              isTop
                ? "Deletes this category and its sub-categories; products become uncategorised."
                : "Products in this sub-category become uncategorised."
            }
          >
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}

import Link from "next/link";
import type { CategoryRow } from "@/db/schema";
import ImageUploadField from "@/components/image-upload-field";
import { saveCategory } from "./actions";

const input =
  "w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-slate-900";
const label =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500";

const ERRORS: Record<string, string> = {
  missing: "Name is required.",
  reserved: "That slug is reserved (new-in / sale) — pick another.",
  parent: "Invalid parent — a sub-category can only sit under a top-level category.",
  "slug-taken": "A category with that slug already exists.",
};

export default function CategoryForm({
  category,
  parents,
  error,
  defaultParentId,
}: {
  category?: CategoryRow;
  parents: CategoryRow[];
  error?: string;
  defaultParentId?: number;
}) {
  // A category can only be re-parented under a top-level category other than
  // itself. (A category that already has children is kept top-level by the
  // server action regardless of what is submitted.)
  const parentOptions = parents.filter((p) => p.id !== category?.id);

  return (
    <form
      action={saveCategory}
      className="mt-6 grid max-w-2xl gap-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      {category && <input type="hidden" name="id" value={category.id} />}

      {error && ERRORS[error] && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {ERRORS[error]}
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="name">Name *</label>
          <input
            id="name"
            name="name"
            required
            defaultValue={category?.name}
            placeholder="T-Shirts"
            className={input}
          />
        </div>
        <div>
          <label className={label} htmlFor="slug">Slug (URL, auto if blank)</label>
          <input
            id="slug"
            name="slug"
            defaultValue={category?.slug}
            placeholder="t-shirts"
            className={input}
          />
        </div>
        <div>
          <label className={label} htmlFor="parentId">Parent category</label>
          <select
            id="parentId"
            name="parentId"
            defaultValue={category?.parentId ?? defaultParentId ?? ""}
            className={input}
          >
            <option value="">— Top level —</option>
            {parentOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-400">
            Leave as “Top level” for a main menu item; pick a parent to make it a
            sub-category.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium" htmlFor="sortOrder">Sort order</label>
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            defaultValue={category?.sortOrder ?? 0}
            className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
        </div>
      </div>

      <ImageUploadField
        name="imageUrl"
        label="Tile image (optional — top-level categories with an image show on the homepage)"
        defaultValue={category?.imageUrl ?? ""}
        folder="norfu/categories"
      />

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={category?.isActive ?? true}
          className="h-4 w-4"
        />
        Visible on storefront
      </label>

      <div className="flex gap-3 border-t border-slate-100 pt-6">
        <button className="rounded-lg bg-slate-900 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:opacity-90">
          {category ? "Save changes" : "Create category"}
        </button>
        <Link
          href="/categories"
          className="rounded-lg border border-slate-300 px-6 py-3 text-xs font-bold uppercase tracking-wider hover:border-slate-900"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

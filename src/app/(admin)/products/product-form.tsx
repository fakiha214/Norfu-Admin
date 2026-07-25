import Link from "next/link";
import type { CategoryRow, ProductRow, ProductSizeRow } from "@/db/schema";
import ImageListEditor from "@/components/image-list-editor";
import SizeStockEditor from "@/components/size-stock-editor";
import ColorEditor from "@/components/color-editor";
import { saveProduct } from "./actions";

const input =
  "w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-slate-900";
const label =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500";

export default function ProductForm({
  product,
  sizes,
  categories,
  error,
}: {
  product?: ProductRow;
  sizes?: ProductSizeRow[];
  categories: CategoryRow[];
  error?: string;
}) {
  const colorRows = (product?.colors ?? []).map((c) => ({
    name: c.name,
    hex: c.hex,
  }));
  const sizeRows = (sizes ?? []).map((s) => ({ size: s.size, stock: s.stock }));

  // Build a hierarchical <option> list: top-level categories with their
  // sub-categories indented underneath.
  const tops = categories.filter((c) => c.parentId === null);
  const childrenOf = (id: number) => categories.filter((c) => c.parentId === id);

  return (
    <form
      action={saveProduct}
      className="mt-6 grid max-w-4xl gap-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      {product && <input type="hidden" name="id" value={product.id} />}

      {error === "missing" && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Name, slug and at least one image are required.
        </p>
      )}
      {error === "slug-taken" && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          A product with that slug already exists — pick a different slug.
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="name">Name *</label>
          <input id="name" name="name" required defaultValue={product?.name} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="slug">Slug (URL) *</label>
          <input
            id="slug"
            name="slug"
            required
            defaultValue={product?.slug}
            placeholder="heavyweight-boxy-tee"
            className={input}
          />
        </div>
        <div>
          <label className={label} htmlFor="categoryId">Category</label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={product?.categoryId ?? ""}
            className={input}
          >
            <option value="">— Uncategorised —</option>
            {tops.map((top) => (
              <optgroup key={top.id} label={top.name}>
                <option value={top.id}>{top.name} (all)</option>
                {childrenOf(top.id).map((child) => (
                  <option key={child.id} value={child.id}>
                    {"  "}
                    {child.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {categories.length === 0 && (
            <p className="mt-1 text-xs text-amber-600">
              No categories yet — add some under Categories first.
            </p>
          )}
        </div>
        <div>
          <label className={label} htmlFor="fit">Fit label</label>
          <input
            id="fit"
            name="fit"
            defaultValue={product?.fit}
            placeholder="Relaxed Fit"
            className={input}
          />
        </div>
        <div>
          <label className={label} htmlFor="badge">Badge</label>
          <select id="badge" name="badge" defaultValue={product?.badge ?? ""} className={input}>
            <option value="">None</option>
            <option value="new">New</option>
            <option value="sale">Sale</option>
          </select>
        </div>
        <div>
          <label className={label} htmlFor="price">Price (PKR) *</label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            required
            defaultValue={product?.price}
            className={input}
          />
        </div>
        <div>
          <label className={label} htmlFor="salePrice">Sale price (PKR, empty = not on sale)</label>
          <input
            id="salePrice"
            name="salePrice"
            type="number"
            min={0}
            defaultValue={product?.salePrice ?? ""}
            className={input}
          />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={product?.description}
          className={input}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className={label}>Sizes &amp; stock</p>
          <SizeStockEditor name="sizes" defaultRows={sizeRows} />
        </div>
        <div>
          <p className={label}>Colours</p>
          <ColorEditor name="colors" defaultRows={colorRows} />
        </div>
      </div>

      <div>
        <p className={label}>Images (up to 8) *</p>
        <ImageListEditor
          name="images"
          defaultImages={product?.images ?? []}
          folder="norfu/products"
          max={8}
        />
      </div>

      <div className="flex flex-wrap items-center gap-8">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={product?.isActive ?? true}
            className="h-4 w-4"
          />
          Visible on storefront
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="showSizeChart"
            defaultChecked={product?.showSizeChart ?? false}
            className="h-4 w-4"
          />
          Show size chart
        </label>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium" htmlFor="sortOrder">Sort order</label>
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            defaultValue={product?.sortOrder ?? 0}
            className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
        </div>
      </div>

      <div className="flex gap-3 border-t border-slate-100 pt-6">
        <button className="rounded-lg bg-slate-900 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:opacity-90">
          {product ? "Save changes" : "Create product"}
        </button>
        <Link
          href="/products"
          className="rounded-lg border border-slate-300 px-6 py-3 text-xs font-bold uppercase tracking-wider hover:border-slate-900"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

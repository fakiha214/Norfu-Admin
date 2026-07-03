import type { ProductRow, ProductSizeRow } from "@/db/schema";
import ImageUploadField from "@/components/image-upload-field";
import { saveProduct } from "./actions";

const input =
  "w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-slate-900";
const label =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500";

export default function ProductForm({
  product,
  sizes,
  error,
}: {
  product?: ProductRow;
  sizes?: ProductSizeRow[];
  error?: string;
}) {
  const colorsText = (product?.colors ?? [])
    .map((c) => `${c.name} | ${c.hex}`)
    .join("\n");
  const sizesText = (sizes ?? [])
    .map((s) => `${s.size} | ${s.stock}`)
    .join("\n");

  return (
    <form
      action={saveProduct}
      className="mt-6 grid max-w-4xl gap-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      {product && <input type="hidden" name="id" value={product.id} />}

      {error === "missing" && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Name, slug and Image A are required.
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
          <label className={label} htmlFor="gender">Gender</label>
          <select id="gender" name="gender" defaultValue={product?.gender ?? "men"} className={input}>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="juniors">Juniors</option>
          </select>
        </div>
        <div>
          <label className={label} htmlFor="category">Category</label>
          <input
            id="category"
            name="category"
            defaultValue={product?.category}
            placeholder="t-shirts, polos, jeans…"
            className={input}
          />
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

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="sizes">
            Sizes &amp; stock (one per line: Size | Stock)
          </label>
          <textarea
            id="sizes"
            name="sizes"
            rows={5}
            defaultValue={sizesText}
            placeholder={"S | 10\nM | 15\nL | 8"}
            className={input}
          />
          <p className="mt-1 text-xs text-slate-400">
            Stock 0 shows the size as sold out on the storefront.
          </p>
        </div>
        <div>
          <label className={label} htmlFor="colors">
            Colours (one per line: Name | #hex)
          </label>
          <textarea
            id="colors"
            name="colors"
            rows={5}
            defaultValue={colorsText}
            placeholder={"Ecru | #D8CFC0\nCharcoal | #3A3A3A"}
            className={input}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <ImageUploadField
          name="imageA"
          label="Image A (main) *"
          required
          defaultValue={product?.imageA}
          folder="norfu/products"
        />
        <ImageUploadField
          name="imageB"
          label="Image B (hover, optional)"
          defaultValue={product?.imageB}
          folder="norfu/products"
        />
      </div>

      <div className="flex items-center gap-8">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={product?.isActive ?? true}
            className="h-4 w-4"
          />
          Visible on storefront
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
        <a
          href="/products"
          className="rounded-lg border border-slate-300 px-6 py-3 text-xs font-bold uppercase tracking-wider hover:border-slate-900"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}

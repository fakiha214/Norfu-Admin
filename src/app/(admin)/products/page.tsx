import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { categories, products, productSizes } from "@/db/schema";
import { deleteProduct, setProductActive } from "./actions";

export const dynamic = "force-dynamic";

const pkr = (n: number) => `PKR ${n.toLocaleString("en-PK")}`;

export default async function ProductsPage() {
  const rows = await db
    .select()
    .from(products)
    .orderBy(asc(products.sortOrder), asc(products.id));

  const sizeRows = await db.select().from(productSizes);
  const stockByProduct = new Map<number, number>();
  for (const s of sizeRows) {
    stockByProduct.set(s.productId, (stockByProduct.get(s.productId) ?? 0) + s.stock);
  }

  const catRows = await db.select().from(categories);
  const catName = new Map<number, string>(catRows.map((c) => [c.id, c.name]));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="mt-1 text-sm text-slate-500">
            {rows.length} products — inactive ones are hidden from the storefront.
          </p>
        </div>
        <Link
          href="/products/new"
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:opacity-90"
        >
          + Add product
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Badge</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.images[0] ?? ""}
                      alt=""
                      className="h-12 w-9 rounded object-cover bg-slate-100"
                    />
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {p.categoryId !== null ? (
                    catName.get(p.categoryId) ?? (
                      <span className="text-slate-300">—</span>
                    )
                  ) : (
                    <span className="text-slate-300">Uncategorised</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {p.salePrice ? (
                    <>
                      <span className="font-semibold text-red-600">{pkr(p.salePrice)}</span>{" "}
                      <span className="text-xs text-slate-400 line-through">{pkr(p.price)}</span>
                    </>
                  ) : (
                    <span className="font-semibold">{pkr(p.price)}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {(() => {
                    const stock = stockByProduct.get(p.id) ?? 0;
                    return (
                      <span
                        className={`font-semibold ${
                          stock === 0
                            ? "text-red-600"
                            : stock <= 10
                              ? "text-amber-600"
                              : "text-slate-700"
                        }`}
                      >
                        {stock === 0 ? "Sold out" : stock}
                      </span>
                    );
                  })()}
                </td>
                <td className="px-4 py-3">
                  {p.badge ? (
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase text-white ${
                        p.badge === "sale" ? "bg-red-600" : "bg-slate-900"
                      }`}
                    >
                      {p.badge}
                    </span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <form action={setProductActive}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="next" value={String(!p.isActive)} />
                    <button
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        p.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-200 text-slate-500"
                      }`}
                      title="Click to toggle"
                    >
                      {p.isActive ? "Active" : "Hidden"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/products/${p.id}`}
                      className="rounded border border-slate-300 px-3 py-1 text-xs font-semibold hover:border-slate-900"
                    >
                      Edit
                    </Link>
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={p.id} />
                      <button className="rounded border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

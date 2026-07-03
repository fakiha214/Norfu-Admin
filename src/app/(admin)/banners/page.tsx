import { asc } from "drizzle-orm";
import { db } from "@/db";
import { banners } from "@/db/schema";
import { updateBanner } from "./actions";

export const dynamic = "force-dynamic";

const SLOT_INFO: Record<string, string> = {
  "hero-1": "Homepage hero — full-screen banner at the top. Title is the big animated headline.",
  "promo-1": "Homepage promo — left tile of the split banner section.",
  "promo-2": "Homepage promo — right tile of the split banner section.",
  "cat-men": "Homepage category tile — Men.",
  "cat-women": "Homepage category tile — Women.",
  "cat-juniors": "Homepage category tile — Juniors.",
  "cat-sale": "Homepage category tile — Sale.",
};

const input =
  "w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-slate-900";
const label =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500";

export default async function BannersPage() {
  const rows = await db.select().from(banners).orderBy(asc(banners.id));

  return (
    <div>
      <h1 className="text-2xl font-bold">Banners</h1>
      <p className="mt-1 text-sm text-slate-500">
        Each banner fills a fixed slot on the storefront. Inactive banners hide that slot.
      </p>

      <div className="mt-6 space-y-6">
        {rows.map((b) => (
          <form
            key={b.id}
            action={updateBanner}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <input type="hidden" name="id" value={b.id} />
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-mono text-sm font-bold">{b.slot}</p>
                <p className="text-xs text-slate-500">{SLOT_INFO[b.slot] ?? ""}</p>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={b.isActive}
                  className="h-4 w-4"
                />
                Active
              </label>
            </div>

            <div className="grid gap-4 lg:grid-cols-[160px_1fr]">
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.imageUrl}
                  alt=""
                  className="h-40 w-full rounded-lg object-cover bg-slate-100"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={label}>Kicker (small text above title)</label>
                  <input name="kicker" defaultValue={b.kicker} className={input} />
                </div>
                <div>
                  <label className={label}>Title</label>
                  <input name="title" defaultValue={b.title} className={input} />
                </div>
                <div>
                  <label className={label}>Copy (subtext)</label>
                  <input name="copy" defaultValue={b.copy} className={input} />
                </div>
                <div>
                  <label className={label}>Button label</label>
                  <input name="ctaLabel" defaultValue={b.ctaLabel} className={input} />
                </div>
                <div>
                  <label className={label}>Link (href)</label>
                  <input name="href" defaultValue={b.href} className={input} />
                </div>
                <div>
                  <label className={label}>Image URL</label>
                  <input name="imageUrl" defaultValue={b.imageUrl} className={input} />
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <button className="rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:opacity-90">
                Save banner
              </button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}

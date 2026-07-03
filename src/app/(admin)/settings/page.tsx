import { db } from "@/db";
import { settings } from "@/db/schema";
import { saveSettings } from "./actions";

export const dynamic = "force-dynamic";

const SETTING_DEFS: { key: string; label: string; hint: string }[] = [
  {
    key: "free_shipping_threshold",
    label: "Free shipping threshold (PKR)",
    hint: "Orders above this amount ship free — drives the cart progress bar.",
  },
  {
    key: "sale_rail_title",
    label: "Homepage sale rail title",
    hint: "Heading of the first product carousel on the homepage.",
  },
  {
    key: "new_rail_title",
    label: "Homepage new-in rail title",
    hint: "Heading of the second product carousel.",
  },
  {
    key: "womens_rail_title",
    label: "Homepage women's rail title",
    hint: "Heading of the third product carousel.",
  },
];

export default async function SettingsPage() {
  const rows = await db.select().from(settings);
  const values = Object.fromEntries(rows.map((s) => [s.key, s.value]));

  return (
    <div>
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-sm text-slate-500">
        Storefront-wide values. Saved instantly; live within a minute.
      </p>

      <form
        action={saveSettings}
        className="mt-6 max-w-2xl space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        {SETTING_DEFS.map((def) => (
          <div key={def.key}>
            <label
              htmlFor={def.key}
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500"
            >
              {def.label}
            </label>
            <input
              id={def.key}
              name={def.key}
              defaultValue={values[def.key] ?? ""}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-slate-900"
            />
            <p className="mt-1 text-xs text-slate-400">{def.hint}</p>
          </div>
        ))}
        <button className="rounded-lg bg-slate-900 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:opacity-90">
          Save settings
        </button>
      </form>
    </div>
  );
}

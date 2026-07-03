import { asc } from "drizzle-orm";
import { db } from "@/db";
import { announcements } from "@/db/schema";
import {
  addAnnouncement,
  deleteAnnouncement,
  setAnnouncementActive,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const rows = await db
    .select()
    .from(announcements)
    .orderBy(asc(announcements.sortOrder), asc(announcements.id));

  return (
    <div>
      <h1 className="text-2xl font-bold">Announcements</h1>
      <p className="mt-1 text-sm text-slate-500">
        These scroll in the black marquee bar at the very top of the storefront.
      </p>

      <form
        action={addAnnouncement}
        className="mt-6 flex max-w-2xl gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <input
          name="message"
          required
          placeholder="FREE SHIPPING ON ORDERS ABOVE PKR 4,000"
          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-slate-900"
        />
        <input
          name="sortOrder"
          type="number"
          defaultValue={rows.length}
          title="Sort order"
          className="w-20 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
        />
        <button className="shrink-0 rounded-lg bg-slate-900 px-5 text-xs font-bold uppercase tracking-wider text-white hover:opacity-90">
          Add
        </button>
      </form>

      <ul className="mt-6 max-w-2xl space-y-2">
        {rows.map((a) => (
          <li
            key={a.id}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
          >
            <span className="w-8 text-center text-xs text-slate-400">{a.sortOrder}</span>
            <span
              className={`flex-1 text-sm font-medium tracking-wide ${
                a.isActive ? "" : "text-slate-400 line-through"
              }`}
            >
              {a.message}
            </span>
            <form action={setAnnouncementActive}>
              <input type="hidden" name="id" value={a.id} />
              <input type="hidden" name="next" value={String(!a.isActive)} />
              <button
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                  a.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {a.isActive ? "Active" : "Hidden"}
              </button>
            </form>
            <form action={deleteAnnouncement}>
              <input type="hidden" name="id" value={a.id} />
              <button className="rounded border border-red-200 px-2.5 py-0.5 text-[11px] font-semibold text-red-600 hover:bg-red-50">
                Delete
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}

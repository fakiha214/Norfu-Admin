import { desc } from "drizzle-orm";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { deleteSubscriber } from "./actions";

export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  const rows = await db
    .select()
    .from(subscribers)
    .orderBy(desc(subscribers.createdAt));

  return (
    <div>
      <h1 className="text-2xl font-bold">Newsletter subscribers</h1>
      <p className="mt-1 text-sm text-slate-500">
        Emails collected from the storefront newsletter form. {rows.length} total.
      </p>

      <div className="mt-6 max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {rows.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-400">
            No subscribers yet.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{s.email}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {s.createdAt.toISOString().slice(0, 10)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={deleteSubscriber}>
                      <input type="hidden" name="id" value={s.id} />
                      <button className="rounded border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { STATUS_STYLES } from "./status-styles";

export const dynamic = "force-dynamic";

const pkr = (n: number) => `PKR ${n.toLocaleString("en-PK")}`;

export default async function OrdersPage() {
  const rows = await db
    .select({
      order: orders,
      itemCount: sql<number>`(SELECT coalesce(sum(${orderItems.qty}), 0)::int FROM ${orderItems} WHERE ${eq(orderItems.orderId, orders.id)})`,
    })
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(200);

  return (
    <div>
      <h1 className="text-2xl font-bold">Orders</h1>
      <p className="mt-1 text-sm text-slate-500">
        {rows.length} orders — remember to email customers to confirm before dispatch.
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {rows.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-slate-400">
            No orders yet — they&rsquo;ll appear here as customers check out.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Confirmation</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(({ order, itemCount }) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-mono font-semibold text-blue-700 hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-xs text-slate-400">{order.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{order.city}</td>
                  <td className="px-4 py-3 text-slate-600">{itemCount}</td>
                  <td className="px-4 py-3 font-semibold">{pkr(order.total)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        order.emailSent
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {order.emailSent ? "Email sent" : "Needs email"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${STATUS_STYLES[order.status]}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {order.createdAt.toISOString().slice(0, 16).replace("T", " ")}
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

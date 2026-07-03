import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { setEmailSent, setOrderStatus } from "../actions";
import { ORDER_STATUSES, STATUS_STYLES } from "../status-styles";

export const dynamic = "force-dynamic";

const pkr = (n: number) => `PKR ${n.toLocaleString("en-PK")}`;

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) notFound();

  const rows = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  const order = rows[0];
  if (!order) notFound();

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId))
    .orderBy(asc(orderItems.id));

  const mailSubject = encodeURIComponent(
    `Norfu order ${order.orderNumber} — confirmation`
  );
  const mailBody = encodeURIComponent(
    `Hi ${order.customerName},\n\nThank you for your Norfu order ${order.orderNumber}!\n\n` +
      items.map((i) => `• ${i.name} (${i.color} / ${i.size}) × ${i.qty} — ${pkr(i.unitPrice * i.qty)}`).join("\n") +
      `\n\nSubtotal: ${pkr(order.subtotal)}\nShipping: ${order.shippingFee === 0 ? "Free" : pkr(order.shippingFee)}\nTotal (Cash on Delivery): ${pkr(order.total)}\n\n` +
      `Delivery address:\n${order.address}, ${order.city}\n\n` +
      `Please reply to this email to confirm your order and we'll dispatch it right away.\n\nTeam Norfu`
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/orders" className="text-xs font-semibold text-blue-700 hover:underline">
            ← All orders
          </Link>
          <h1 className="mt-1 font-mono text-2xl font-bold">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Placed {order.createdAt.toISOString().slice(0, 16).replace("T", " ")} ·{" "}
            Cash on Delivery
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${STATUS_STYLES[order.status]}`}
        >
          {order.status}
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Items + totals */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <p className="border-b border-slate-200 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
            Items
          </p>
          <ul className="divide-y divide-slate-100 px-5">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt=""
                  className="h-14 w-11 rounded object-cover bg-slate-100"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-slate-400">
                    {item.color} / {item.size} × {item.qty}
                  </p>
                </div>
                <p className="text-sm font-semibold">{pkr(item.unitPrice * item.qty)}</p>
              </li>
            ))}
          </ul>
          <div className="space-y-1.5 border-t border-slate-200 px-5 py-4 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>{pkr(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Shipping</span>
              <span>{order.shippingFee === 0 ? "Free" : pkr(order.shippingFee)}</span>
            </div>
            <div className="flex justify-between pt-2 text-base font-bold">
              <span>Total (COD)</span>
              <span>{pkr(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Customer */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Customer
            </p>
            <p className="mt-3 font-medium">{order.customerName}</p>
            <p className="mt-1 text-sm text-slate-600">{order.email}</p>
            <p className="text-sm text-slate-600">{order.phone}</p>
            <p className="mt-3 text-sm text-slate-600">
              {order.address}
              <br />
              {order.city}
            </p>
            {order.notes && (
              <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                Note: {order.notes}
              </p>
            )}
          </div>

          {/* Manual confirmation email */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Confirmation email
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Send the customer a confirmation email, then mark it as sent.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={`mailto:${order.email}?subject=${mailSubject}&body=${mailBody}`}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:opacity-90"
              >
                Compose email
              </a>
              <form action={setEmailSent}>
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="next" value={String(!order.emailSent)} />
                <button
                  className={`rounded-lg border px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                    order.emailSent
                      ? "border-green-300 bg-green-50 text-green-700"
                      : "border-slate-300 hover:border-slate-900"
                  }`}
                >
                  {order.emailSent ? "✓ Email sent" : "Mark email sent"}
                </button>
              </form>
            </div>
          </div>

          {/* Status */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Update status
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Cancelling an order returns its stock to inventory.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {ORDER_STATUSES.map((status) => (
                <form key={status} action={setOrderStatus}>
                  <input type="hidden" name="id" value={order.id} />
                  <input type="hidden" name="status" value={status} />
                  <button
                    disabled={order.status === status}
                    className={`rounded-lg border px-3.5 py-2 text-xs font-semibold capitalize transition-colors ${
                      order.status === status
                        ? "cursor-default border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300 hover:border-slate-900"
                    }`}
                  >
                    {status}
                  </button>
                </form>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

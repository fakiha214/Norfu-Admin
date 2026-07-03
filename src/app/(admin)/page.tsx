import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { announcements, banners, orders, products, subscribers } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [
    orderCount,
    pendingCount,
    productCount,
    activeCount,
    bannerCount,
    announcementCount,
    subscriberCount,
  ] = await Promise.all([
    db.$count(orders),
    db.$count(orders, eq(orders.status, "pending")),
    db.$count(products),
    db.$count(products, eq(products.isActive, true)),
    db.$count(banners),
    db.$count(announcements),
    db.$count(subscribers),
  ]);

  const cards = [
    { label: "Orders", value: orderCount, href: "/orders" },
    { label: "Pending orders", value: pendingCount, href: "/orders", alert: pendingCount > 0 },
    { label: "Products", value: productCount, href: "/products" },
    { label: "Active products", value: activeCount, href: "/products" },
    { label: "Banners", value: bannerCount, href: "/banners" },
    { label: "Announcements", value: announcementCount, href: "/announcements" },
    { label: "Subscribers", value: subscriberCount, href: "/subscribers" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        Changes appear on the storefront within about a minute (60s cache).
      </p>
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${
              card.alert ? "border-amber-300 bg-amber-50" : "border-slate-200"
            }`}
          >
            <p className="text-3xl font-bold">{card.value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {card.label}
            </p>
          </Link>
        ))}
      </div>
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Quick actions
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/products/new"
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:opacity-90"
          >
            + Add product
          </Link>
          <Link
            href="/banners"
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:border-slate-900"
          >
            Edit hero banner
          </Link>
          <Link
            href="/announcements"
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:border-slate-900"
          >
            Edit announcements
          </Link>
        </div>
      </div>
    </div>
  );
}

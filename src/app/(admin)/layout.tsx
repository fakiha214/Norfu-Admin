import Link from "next/link";
import { logout } from "@/app/login/actions";

const NAV = [
  { label: "Dashboard", href: "/" },
  { label: "Orders", href: "/orders" },
  { label: "Products", href: "/products" },
  { label: "Banners", href: "/banners" },
  { label: "Announcements", href: "/announcements" },
  { label: "Settings", href: "/settings" },
  { label: "Subscribers", href: "/subscribers" },
];

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 flex w-56 flex-col bg-slate-900 text-slate-100">
        <div className="px-6 py-6">
          <p className="text-lg font-black tracking-[0.3em]">NORFU</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
            Admin Panel
          </p>
        </div>
        <nav className="flex-1 space-y-0.5 px-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-800 p-3">
          <a
            href="https://github.com/fakiha214/norfu"
            target="_blank"
            rel="noreferrer"
            className="block rounded-lg px-3 py-2 text-xs text-slate-400 hover:text-white"
          >
            Storefront repo ↗
          </a>
          <form action={logout}>
            <button className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-400 transition-colors hover:bg-slate-800 hover:text-white">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="ml-56 flex-1 px-10 py-8">{children}</main>
    </div>
  );
}

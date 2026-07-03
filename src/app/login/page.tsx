import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-center text-2xl font-black tracking-[0.3em]">NORFU</p>
        <p className="mt-1 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Admin Panel
        </p>
        <form action={login} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-slate-900"
            />
          </div>
          {error && (
            <p className="text-xs font-medium text-red-600">
              Incorrect password — try again.
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

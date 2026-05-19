"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plane, LogOut, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useFlightStore } from "@/lib/stores/use-flight-store";
import { useUserStore } from "@/lib/stores/use-user-store";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/", label: "Search" },
  { href: "/my-bookings", label: "My Bookings" },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setLocalSession] = useState<Session | null>(null);
  const setSession = useUserStore((state) => state.setSession);
  const resetUser = useUserStore((state) => state.resetUser);
  const resetBooking = useFlightStore((state) => state.resetBooking);

  useEffect(() => {
    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch {
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setLocalSession(data.session);
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setLocalSession(nextSession);
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    resetUser();
    resetBooking();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-950 dark:text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-600 text-white">
            <Plane size={18} />
          </span>
          <span>Source Flights</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                pathname === item.href
                  ? "bg-slate-900 text-white dark:bg-teal-500 dark:text-slate-950"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {session ? (
            <>
              <span className="hidden items-center gap-2 text-sm text-slate-600 dark:text-slate-300 md:flex">
                <UserRound size={16} />
                {session.user.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
            >
              Login
            </Link>
          )}
        </div>
      </div>
      <nav className="flex border-t border-slate-100 dark:border-slate-800 sm:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 px-3 py-2 text-center text-sm font-medium ${
              pathname === item.href ? "text-teal-700 dark:text-teal-300" : "text-slate-600 dark:text-slate-300"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

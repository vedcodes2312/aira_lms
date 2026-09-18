"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { clearToken, isLoggedIn, getMe } from "@/lib/api";
import { ShieldCheck, LogOut, BookOpen, Plus, LayoutDashboard, UserCircle, Compass } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isLoggedIn()) {
      getMe()
        .then((user) => {
          setIsAdmin(!!user.is_admin);
        })
        .catch(() => {
          setIsAdmin(false);
        });
    }
  }, [pathname]);

  const handleLogout = () => {
    clearToken();
    router.push("/login");
  };

  const hideNav = ["/login", "/signup"].includes(pathname);
  if (hideNav) return null;

  const loggedIn = mounted && isLoggedIn();

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs sticky top-0 z-50">
      <Link href={loggedIn ? "/dashboard" : "/"} className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-white group">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm group-hover:bg-indigo-500 transition-colors">
          A
        </div>
        <span>AIRA</span>
      </Link>

      <div className="flex gap-3 sm:gap-5 items-center text-sm font-medium">
        {loggedIn ? (
          <>
            <Link
              href="/dashboard"
              className={`hover:text-indigo-400 transition-colors flex items-center gap-1.5 ${
                pathname === "/dashboard" ? "text-indigo-400 font-bold" : "text-slate-300"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            <Link
              href="/explore"
              className={`hover:text-indigo-400 transition-colors flex items-center gap-1.5 ${
                pathname === "/explore" ? "text-indigo-400 font-bold" : "text-slate-300"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span className="hidden sm:inline">Explore</span>
            </Link>

            <Link
              href="/generate"
              className={`hover:text-indigo-400 transition-colors flex items-center gap-1.5 ${
                pathname === "/generate" ? "text-indigo-400 font-bold" : "text-slate-300"
              }`}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Course</span>
            </Link>

            <Link
              href="/profile"
              className={`hover:text-indigo-400 transition-colors flex items-center gap-1.5 ${
                pathname === "/profile" ? "text-indigo-400 font-bold" : "text-slate-300"
              }`}
            >
              <UserCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-xs ${
                  pathname === "/admin"
                    ? "bg-amber-500 text-slate-950 font-black ring-2 ring-amber-300"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Panel
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition border border-slate-700"
              id="nav-logout-btn"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          <>
            <Link
              href="/explore"
              className="text-slate-300 hover:text-white transition flex items-center gap-1"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Courses</span>
            </Link>
            <Link href="/login" className="text-slate-300 hover:text-white transition">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

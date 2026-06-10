"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { useState } from "react";

export default function OperatorHeader({ user }: { user: any }) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    const result = await logoutAction();

    if (result.success) {
      router.push("/login");
      router.refresh();
    }
  };

  const initials = user?.fullname
    ? user.fullname
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "OP";

  return (
    <>
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-8 h-16 bg-white shadow-sm border-b border-slate-200">

        {/* LEFT */}
        <div className="flex items-center gap-3">

          {/* Hamburger Mobile */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[26px] text-slate-700">
              menu
            </span>
          </button>

          <div className="bg-primary p-2 rounded-full flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[20px]">
              book_4
            </span>
          </div>

          <span className="text-lg md:text-xl font-bold text-primary tracking-tight">
            LMS Greenfields
          </span>
        </div>

        {/* DESKTOP MENU */}
        <div className="flex items-center gap-6">

          <nav className="hidden md:flex items-center gap-6 h-16">
            <Link
              href="/operator/dashboard"
              className={`flex items-center h-full font-semibold text-sm border-b-2 transition-all ${
                pathname === "/operator/dashboard"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-500 hover:text-emerald-600"
              }`}
            >
              Dashboard
            </Link>

            <Link
              href="/operator/my-courses"
              className={`flex items-center h-full font-semibold text-sm border-b-2 transition-all ${
                pathname.startsWith("/operator/my-courses")
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-500 hover:text-emerald-600"
              }`}
            >
              Materi Saya
            </Link>
          </nav>

          <div className="hidden md:block h-8 w-px bg-slate-200 mx-2"></div>

          {/* USER */}
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="relative w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-xs border border-emerald-200">
              {initials}
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>

            <div className="hidden md:flex flex-col">
              <span className="text-xs font-bold text-slate-800">
                {user?.fullname || "Operator"}
              </span>

              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                {user?.position_name ||
                  user?.role ||
                  "Karyawan"}
              </span>
            </div>
          </div>

          {/* LOGOUT DESKTOP */}
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            <span className="material-symbols-outlined text-[20px]">
              logout
            </span>

            <span className="text-xs font-bold">
              Logout
            </span>
          </button>
        </div>
      </header>

      {/* OVERLAY */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${
          mobileMenuOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* DRAWER */}
      <aside
        className={`fixed top-0 left-0 z-[70] h-full w-[280px] bg-white shadow-2xl transition-transform duration-300 ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-full text-white">
              <span className="material-symbols-outlined">
                book_4
              </span>
            </div>

            <span className="font-bold text-primary">
              LMS Greenfields
            </span>
          </div>

          <button onClick={() => setMobileMenuOpen(false)}>
            <span className="material-symbols-outlined">
              close
            </span>
          </button>
        </div>

        {/* MENU */}
        <nav className="p-4 space-y-2">
          <Link
            href="/operator/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              pathname === "/operator/dashboard"
                ? "bg-emerald-50 text-emerald-700 font-semibold"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className="material-symbols-outlined">
              dashboard
            </span>
            Dashboard
          </Link>

          <Link
            href="/operator/my-courses"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              pathname.startsWith("/operator/my-courses")
                ? "bg-emerald-50 text-emerald-700 font-semibold"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className="material-symbols-outlined">
              menu_book
            </span>
            Materi Saya
          </Link>
        </nav>

        {/* USER INFO */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 p-4 bg-slate-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700">
              {initials}
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">
                {user?.fullname || "Operator"}
              </p>

              <p className="text-xs text-slate-500">
                {user?.position_name ||
                  user?.role ||
                  "Karyawan"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-100"
          >
            <span className="material-symbols-outlined">
              logout
            </span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/app/actions/auth";

export default function LoginPage() {
  const router = useRouter();

  const [nik, setNik] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await loginAction(nik, password);

      if (!result.success) {
        setErrorMessage(result.message);
      } else {
        if (result.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/operator/dashboard");
        }
      }
    } catch (error) {
      setErrorMessage("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 bg-slate-50 overflow-hidden">
      <div
        className="absolute top-[-10%] left-[-5%] w-96 h-96 rounded-full blur-[100px] opacity-60 pointer-events-none"
        style={{ backgroundColor: "var(--primary-light)" }}
      ></div>
      <div
        className="absolute bottom-[-10%] right-[-5%] w-120 h-120 rounded-full blur-[120px] opacity-40 pointer-events-none"
        style={{ backgroundColor: "var(--primary-light)" }}
      ></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-10 flex flex-col items-center border border-slate-100">
          <div className="flex items-center justify-center gap-3 mb-8 w-full">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-[28px]">
                book_4
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
              LMS Greenfields
            </h1>
          </div>

          {/* KOREKSI 1: Kotak Error Message ditambahkan di sini */}
          {errorMessage && (
            <div className="w-full bg-red-50 border border-red-200 text-red-600 text-sm py-2.5 px-4 rounded-lg mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              <p>{errorMessage}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="w-full flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label
                className="text-sm font-semibold text-slate-600"
                htmlFor="nik"
              >
                NIK Karyawan
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                  badge
                </span>
                <input
                  id="nik"
                  name="nik"
                  type="text"
                  placeholder="Masukkan NIK"
                  required
                  disabled={isLoading}
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50/50 rounded-xl border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  style={
                    {
                      "--tw-ring-color": "var(--primary)",
                    } as React.CSSProperties
                  }
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-sm font-semibold text-slate-600"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                  lock
                </span>

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan Password"
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-slate-50/50 rounded-xl border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  style={
                    {
                      "--tw-ring-color": "var(--primary)",
                    } as React.CSSProperties
                  }
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[52%] -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button (Sudah Aman) */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full py-3 text-white font-semibold rounded-xl shadow-md transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--primary)" }}
              onMouseOver={(e) =>
                !isLoading &&
                (e.currentTarget.style.backgroundColor = "var(--primary-hover)")
              }
              onMouseOut={(e) =>
                !isLoading &&
                (e.currentTarget.style.backgroundColor = "var(--primary)")
              }
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">
                    progress_activity
                  </span>
                  Memproses...
                </>
              ) : (
                <>
                  Masuk Portal
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Support Link */}
          <div className="mt-8 pt-5 border-t border-slate-100 w-full text-center">
            <a
              href="#"
              className="text-sm font-medium text-slate-500 transition-colors hover:underline underline-offset-4"
              style={{ color: "var(--primary)" }}
            >
              Butuh bantuan IT? Hubungi Support
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

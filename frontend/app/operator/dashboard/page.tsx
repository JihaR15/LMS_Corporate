import React from "react";
import { cookies } from "next/headers";

async function getUserProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    const result = await response.json();
    return result.data;
  } catch (error) {
    return null;
  }
}

async function getOperatorDashboardData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/operator/dashboard-data`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    const result = await response.json();
    return result.data || { modules: [], stats: { total_passed_tests: 0 } };
  } catch (error) {
    return { modules: [], stats: { total_passed_tests: 0 } };
  }
}

export default async function OperatorDashboardPage() {
  const [user, dashboardData] = await Promise.all([
    getUserProfile(),
    getOperatorDashboardData()
  ]);

  const { modules, stats } = dashboardData;

  const totalModules = modules.length;
  const completedModulesCount = modules.filter((m: any) => m.total_materials > 0 && m.total_materials === m.completed_materials).length;
  const overallPercentage = totalModules > 0 ? Math.round((completedModulesCount / totalModules) * 100) : 0;

  const radius = 64;
  const circumference = 2 * Math.PI * radius; // ~402
  const strokeDashoffset = circumference - (overallPercentage / 100) * circumference;

  return (
    <div className="space-y-12 pb-12">
      {/* 1. Hero Section Banner (DINAMIS) */}
      <section className="relative w-full h-65 flex items-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-linear-to-r from-emerald-900 via-emerald-800 to-slate-900 z-10 opacity-90"></div>
        <div className="container mx-auto px-8 relative z-20 max-w-7xl">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full mb-4 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-300 text-[10px] font-bold uppercase tracking-widest">Selamat Datang Kembali</span>
            </div>
            <h1 className="font-bold text-white text-3xl md:text-4xl leading-tight mb-3">
              Mari lanjutkan pembelajaranmu, {user?.fullname || "Operator"}!
            </h1>
            <p className="text-emerald-100/80 text-sm max-w-xl">
              Selesaikan modul harian Anda untuk memastikan standar kualitas dan keamanan produksi tetap terjaga di level tertinggi.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Main Content Grid */}
      <div className="container mx-auto px-8 max-w-7xl">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Modul Wajib Untukmu</h2>
            <p className="text-slate-500 text-sm">Selesaikan kurikulum wajib kuartal ini untuk mempertahankan sertifikasi operator.</p>
          </div>
        </div>

        {/* Grid 3 Kolom Kartu Belajar Dinamis */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.length > 0 ? (
            modules.map((mod: any) => {
              // Hitung persentase progress materi di dalam modul ini
              const modulePercent = mod.total_materials > 0 
                ? Math.round((mod.completed_materials / mod.total_materials) * 100) 
                : 0;

              return (
                <div key={mod.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow group p-6">
                  <div className="flex-1">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-emerald-600 text-[28px]">menu_book</span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 mb-2 leading-snug">{mod.title}</h3>
                    <div className="flex items-center gap-3 mb-6 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">fact_check</span> 
                        {mod.total_materials} Materi
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">grade</span> 
                        Passing: {Math.round(mod.passing_score)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500">Progress Belajar</span>
                        <span className="text-emerald-600">{modulePercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="h-2 rounded-full bg-primary transition-all duration-500" style={{ width: `${modulePercent}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <button className="mt-6 w-full bg-primary hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all text-sm">
                    {modulePercent === 100 ? "Buka Post Test" : "Lanjutkan Belajar"}
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              );
            })
          ) : (
            <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
              Belum ada modul pelatihan yang ditugaskan untuk posisi jabatan Anda saat ini.
            </div>
          )}
        </div>

        {/* 3. Bento Style Achievement & Support Section */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Ringkasan Pencapaian Dinamis */}
          <div className="lg:col-span-2 bg-slate-100 rounded-2xl p-6 md:p-8 border border-slate-200 flex flex-col sm:flex-row gap-6 items-center">
            <div className="relative w-36 h-36 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-slate-200" cx="72" cy="72" fill="transparent" r={radius} stroke="currentColor" strokeWidth="8"></circle>
                <circle className="text-primary transition-all duration-1000" cx="72" cy="72" fill="transparent" r={radius} stroke="currentColor" strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-800">{overallPercentage}%</span>
                <span className="text-[10px] text-slate-500 font-medium">Target</span>
              </div>
            </div>
            <div className="flex-1 w-full">
              <h3 className="font-bold text-xl text-slate-800 mb-2">Ringkasan Capaian Anda</h3>
              <p className="text-slate-500 text-sm mb-4">
                Anda telah menuntaskan {completedModulesCount} dari {totalModules} seluruh kurikulum wajib posisi Anda. Pertahankan performa kerja Anda!
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-xl text-center shadow-sm">
                  <span className="block text-xl font-bold text-primary">{completedModulesCount}</span>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Modul Tuntas</span>
                </div>
                <div className="bg-white p-3 rounded-xl text-center shadow-sm">
                  <span className="block text-xl font-bold text-primary">{stats.total_passed_tests}</span>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Sertifikat Lulus</span>
                </div>
                <div className="bg-white p-3 rounded-xl text-center shadow-sm">
                  <span className="block text-xl font-bold text-primary">{modules.reduce((acc: number, cur: any) => acc + cur.completed_materials, 0)}</span>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Materi Dibaca</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pusat Bantuan */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-800 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">notifications_active</span>
                Pusat Bantuan Modul
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3 items-start text-sm">
                  <div className="bg-slate-100 p-2 rounded-lg text-slate-700">
                    <span className="material-symbols-outlined text-base">help</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 leading-tight">Kendala Teknis?</p>
                    <p className="text-xs text-slate-400">Hubungi tim IT via GreenHelp.</p>
                  </div>
                </div>
              </div>
            </div>
            <button className="mt-6 w-full border border-slate-300 hover:bg-slate-50 text-slate-600 text-xs font-semibold py-2.5 rounded-xl transition-colors">
              Buka Dokumentasi Karyawan
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
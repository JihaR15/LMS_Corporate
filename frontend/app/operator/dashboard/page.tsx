import React from "react";

export default function OperatorDashboardPage() {
  return (
    <div className="space-y-12">
      {/* 1. Hero Section Banner */}
      <section className="relative w-full h-65 flex items-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-linear-to-r from-emerald-900 via-emerald-800 to-slate-900 z-10 opacity-90"></div>
        <div className="container mx-auto px-8 relative z-20 max-w-7xl">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full mb-4 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-300 text-[10px] font-bold uppercase tracking-widest">Selamat Datang Kembali</span>
            </div>
            <h1 className="font-bold text-white text-3xl md:text-4xl leading-tight mb-3">
              Mari lanjutkan pembelajaranmu hari ini!
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

        {/* Grid 3 Kolom Kartu Belajar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: SOP Pasteurisasi */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow group p-6">
            <div className="flex-1">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-emerald-600 text-[28px]">menu_book</span>
              </div>
              <h3 className="font-bold text-lg text-slate-800 mb-2 leading-snug">SOP Pasteurisasi Susu Segar</h3>
              <div className="flex items-center gap-3 mb-6 text-xs text-slate-500">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> 45 Menit</span>
                <span>•</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">star</span> Level Dasar</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500">Progress Belajar</span>
                  <span className="text-emerald-600">50%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="h-2 rounded-full bg-primary" style={{ width: "50%" }}></div>
                </div>
              </div>
            </div>
            <button className="mt-6 w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all text-sm">
              Lanjutkan Belajar
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>

          {/* Card 2: K3 */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow group p-6">
            <div className="flex-1">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-red-600 text-[28px]">health_and_safety</span>
              </div>
              <h3 className="font-bold text-lg text-slate-800 mb-2 leading-snug">Kesehatan & Keselamatan Kerja</h3>
              <div className="flex items-center gap-3 mb-6 text-xs text-slate-500">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> 120 Menit</span>
                <span>•</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">verified</span> Sertifikasi</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500">Progress Belajar</span>
                  <span className="text-emerald-600">75%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="h-2 rounded-full bg-primary" style={{ width: "75%" }}></div>
                </div>
              </div>
            </div>
            <button className="mt-6 w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all text-sm">
              Lanjutkan Belajar
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>

        </div>

        {/* 3. Bento Style Achievement & Support Section */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Ringkasan Pencapaian (2 Kolom) */}
          <div className="lg:col-span-2 bg-slate-100 rounded-2xl p-6 md:p-8 border border-slate-200 flex flex-col sm:flex-row gap-6 items-center">
            <div className="relative w-36 h-36 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-slate-200" cx="72" cy="72" fill="transparent" r="64" stroke="currentColor" strokeWidth="8"></circle>
                <circle className="text-primary" cx="72" cy="72" fill="transparent" r="64" stroke="currentColor" strokeWidth="8" strokeDasharray="402" strokeDashoffset="1005"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-800">75%</span>
                <span className="text-[10px] text-slate-500 font-medium">Target</span>
              </div>
            </div>
            <div className="flex-1 w-full">
              <h3 className="font-bold text-xl text-slate-800 mb-2">Ringkasan Capaian Anda</h3>
              <p className="text-slate-500 text-sm mb-4">Anda telah menyelesaikan 12 dari 16 modul wajib bulan ini. Pertahankan kompetensi Anda!</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3 rounded-xl text-center shadow-sm">
                  <span className="block text-xl font-bold text-primary">12</span>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Modul Lulus</span>
                </div>
                <div className="bg-white p-3 rounded-xl text-center shadow-sm">
                  <span className="block text-xl font-bold text-primary">48</span>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Jam Belajar</span>
                </div>
                <div className="bg-white p-3 rounded-xl text-center shadow-sm">
                  <span className="block text-xl font-bold text-primary">3</span>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Sertifikat</span>
                </div>
                <div className="bg-white p-3 rounded-xl text-center shadow-sm">
                  <span className="block text-xl font-bold text-primary">150</span>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Poin Poin</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pusat Bantuan (1 Kolom) */}
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
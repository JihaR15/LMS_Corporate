import React from "react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* 1. Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-emerald-50 border border-emerald-100 p-8 flex flex-col md:flex-row justify-between items-center shadow-sm">
        <div className="z-10 max-w-2xl">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Selamat Datang, Administrator Utama
          </h1>
          <p className="text-slate-600 text-lg mb-6">
            Pantau perkembangan kompetensi karyawan dan kelola kurikulum
            pelatihan perusahaan dalam satu dashboard terintegrasi.
          </p>
          <button
            className="px-6 py-3 text-white font-semibold rounded-xl shadow-md transition-all duration-200"
            style={{ backgroundColor: "var(--primary)" }}
          >
            Buat Modul Baru
          </button>
        </div>
        {/* Dekorasi Visual */}
        <div className="absolute right-[-5%] top-[-20%] opacity-10 hidden md:block">
          <span
            className="material-symbols-outlined text-[250px]"
            style={{ color: "var(--primary)" }}
          >
            school
          </span>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Card 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Total Karyawan
            </p>
            <h3 className="text-4xl font-bold text-slate-800">1,284</h3>
            <p
              className="text-sm font-medium flex items-center gap-1 mt-2"
              style={{ color: "var(--primary)" }}
            >
              <span className="material-symbols-outlined text-[18px]">
                trending_up
              </span>
              +12% dari bulan lalu
            </p>
          </div>
          <div className="bg-emerald-100 p-3 rounded-xl">
            <span className="material-symbols-outlined text-emerald-700 text-[32px]">
              person_search
            </span>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Modul Tersedia
            </p>
            <h3 className="text-4xl font-bold text-slate-800">86</h3>
            <p className="text-sm font-medium text-slate-500 flex items-center gap-1 mt-2">
              <span className="material-symbols-outlined text-[18px]">
                library_books
              </span>
              6 Modul baru minggu ini
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl">
            <span className="material-symbols-outlined text-blue-600 text-[32px]">
              auto_stories
            </span>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Ujian Diselesaikan
            </p>
            <h3 className="text-4xl font-bold text-slate-800">4,921</h3>
            <p
              className="text-sm font-medium flex items-center gap-1 mt-2"
              style={{ color: "var(--primary)" }}
            >
              <span className="material-symbols-outlined text-[18px]">
                check_circle
              </span>
              94.2% Tingkat Kelulusan
            </p>
          </div>
          <div className="bg-orange-50 p-3 rounded-xl">
            <span className="material-symbols-outlined text-orange-600 text-[32px]">
              fact_check
            </span>
          </div>
        </div>
      </div>

      {/* 3. Bento Grid (Tabel & Progress) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabel Aktivitas (2 Kolom) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
            <h4 className="text-lg font-bold text-slate-800">
              Aktivitas Karyawan Terbaru
            </h4>
            <button
              className="text-sm font-semibold hover:underline"
              style={{ color: "var(--primary)" }}
            >
              Lihat Semua
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Karyawan</th>
                  <th className="px-6 py-4 font-semibold">Modul</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Skor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                      AS
                    </div>
                    <span className="font-medium text-slate-800">
                      Agus Setiawan
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    SOP Pasteurisasi
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                      SELESAI
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">95/100</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                      RM
                    </div>
                    <span className="font-medium text-slate-800">
                      Rina Melati
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    Kesehatan Kerja
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                      PROSES
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-400">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Progress Sidebar (1 Kolom) */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex-1">
            <h4 className="text-lg font-bold text-slate-800 mb-6">
              Progress Modul Populer
            </h4>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    Dasar Peternakan
                  </span>
                  <span
                    className="text-xs font-bold"
                    style={{ color: "var(--primary)" }}
                  >
                    85%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: "85%", backgroundColor: "var(--primary)" }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    Standar Higienitas
                  </span>
                  <span
                    className="text-xs font-bold"
                    style={{ color: "var(--primary)" }}
                  >
                    62%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: "62%", backgroundColor: "var(--primary)" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

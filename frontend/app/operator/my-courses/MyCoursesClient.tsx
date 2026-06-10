"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MyCoursesClient({ modules, stats }: { modules: any[], stats: any }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"Semua" | "Sedang Berjalan" | "Selesai">("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  
  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // Tampilkan 4 modul per halaman

  const totalModules = modules.length;
  const totalReadMaterials = modules.reduce((acc: number, cur: any) => acc + cur.completed_materials, 0);

  // Reset pagination ke halaman 1 saat filter atau pencarian berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // 1. Logika Filter & Pencarian
  const filteredModules = modules.filter((mod: any) => {
    const isTestPassed = mod.is_test_passed === true || mod.is_test_passed === 1;
    
    let matchesTab = true;
    if (activeTab === "Selesai") matchesTab = isTestPassed;
    if (activeTab === "Sedang Berjalan") matchesTab = !isTestPassed;

    const matchesSearch = mod.title.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // 2. Logika Pemotongan Array untuk Pagination
  const totalPages = Math.ceil(filteredModules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedModules = filteredModules.slice(startIndex, startIndex + itemsPerPage);

  return (
    <main className="flex-1 flex flex-col">
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Page Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Materi & Hasil Pelatihan</h2>
            <p className="text-slate-500 mt-1">Pantau perkembangan belajar dan hasil Post-Test Anda di sini.</p>
          </div>
          
          <div className="w-full md:w-auto relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">search</span>
            <input 
              type="text" 
              placeholder="Cari nama modul..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-72 pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-700 placeholder:text-slate-400 shadow-sm"
            />
          </div>
        </section>

        {/* Stats Overview */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[32px]">menu_book</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Modul Diikuti</p>
              <h3 className="text-2xl font-bold text-slate-800">{totalModules} <span className="text-base font-normal text-slate-500">Modul</span></h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <span className="material-symbols-outlined text-[32px]">fact_check</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Materi Dibaca</p>
              <h3 className="text-2xl font-bold text-slate-800">{totalReadMaterials} <span className="text-base font-normal text-slate-500">Materi</span></h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
              <span className="material-symbols-outlined text-[32px]">task_alt</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Ujian Lulus</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats?.total_passed_tests || 0} <span className="text-base font-normal text-slate-500">Ujian</span></h3>
            </div>
          </div>
        </section>

        {/* Course List */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200 gap-4">
            <h3 className="text-xl font-bold text-slate-800 pb-3">Daftar Modul</h3>
            <div className="flex gap-6 text-sm font-semibold overflow-x-auto no-scrollbar">
              {["Semua", "Sedang Berjalan", "Selesai"].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`pb-3 whitespace-nowrap transition-all border-b-2 ${
                    activeTab === tab 
                      ? "text-emerald-600 border-emerald-600" 
                      : "text-slate-400 border-transparent hover:text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {paginatedModules.length > 0 ? (
              paginatedModules.map((mod: any) => {
                const isTestPassed = mod.is_test_passed === true || mod.is_test_passed === 1;
                const materialRatio = mod.total_materials > 0 ? (mod.completed_materials / mod.total_materials) : 0;
                const isReadyForTest = materialRatio === 1 && !isTestPassed && mod.total_materials > 0;
                const isStarted = mod.completed_materials > 0;
                
                let modulePercent = 0;
                if (isTestPassed) modulePercent = 100;
                else modulePercent = Math.round(materialRatio * 90);

                return (
                  <div key={mod.id} className={`bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full group ${isTestPassed ? 'border-emerald-200' : 'border-slate-200'}`}>
                    <div className="p-6 flex flex-col justify-between space-y-5 h-full">
                      
                      {/* Label Status */}
                      {isTestPassed ? (
                        <div className="inline-block w-fit px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg uppercase">Selesai Tuntas</div>
                      ) : isReadyForTest ? (
                        <div className="inline-block w-fit px-3 py-1 bg-orange-50 text-orange-700 text-xs font-bold rounded-lg uppercase">Siap Ujian</div>
                      ) : isStarted ? (
                        <div className="inline-block w-fit px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg uppercase">Sedang Berjalan</div>
                      ) : (
                        <div className="inline-block w-fit px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg uppercase">Belum Dimulai</div>
                      )}

                      {/* Judul & Detail Nilai */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-emerald-700 transition-colors">{mod.title}</h4>
                          <p className="text-sm text-slate-500 mt-2 line-clamp-2">KKM: {Math.round(mod.passing_score)} | {mod.total_materials} Materi Pelatihan</p>
                        </div>
                        {isTestPassed && (
                          <div className="flex flex-col items-center justify-center p-3 bg-emerald-50 rounded-xl border border-emerald-100 min-w-[80px] shrink-0">
                            <span className="text-[10px] font-bold text-emerald-600 uppercase">Nilai</span>
                            <span className="text-xl font-black text-emerald-700">{mod.test_score ? Math.round(mod.test_score) : 100}</span>
                            {/* Menampilkan Jumlah Percobaan */}
                            <span className="text-[9px] font-bold text-emerald-500 mt-1 uppercase">Percobaan {mod.test_attempt || 0}</span>
                          </div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 font-semibold">Progres Keseluruhan</span>
                          <span className={`font-bold ${isTestPassed ? 'text-emerald-600' : isReadyForTest ? 'text-orange-600' : 'text-blue-600'}`}>
                            {modulePercent}%
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-1000 ${isTestPassed ? 'bg-emerald-500' : isReadyForTest ? 'bg-orange-500' : 'bg-blue-500'}`} style={{ width: `${modulePercent}%` }}></div>
                        </div>
                      </div>

                      {/* Tombol Aksi */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        {isTestPassed ? (
                          <>
                            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                              <span className="material-symbols-outlined text-[18px]">task_alt</span>
                              <span className="text-xs font-bold">Lulus Post-Test</span>
                            </div>
                            <button onClick={() => router.push(`/operator/learn/${mod.id}`)} className="border border-slate-300 text-slate-700 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-all">
                              Review Modul
                            </button>
                          </>
                        ) : isReadyForTest ? (
                          <>
                            <div className="flex items-center gap-2 text-orange-600">
                              <span className="material-symbols-outlined text-[18px]">quiz</span>
                              <span className="text-xs font-semibold">Ujian Terbuka</span>
                            </div>
                            <button onClick={() => router.push(`/operator/learn/${mod.id}/test`)} className="bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-orange-700 transition-all flex items-center gap-2">
                              Mulai Post-Test <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 text-slate-500">
                              <span className="material-symbols-outlined text-[18px]">menu_book</span>
                              <span className="text-xs font-semibold">{mod.completed_materials} dari {mod.total_materials} Dibaca</span>
                            </div>
                            <button onClick={() => router.push(`/operator/learn/${mod.id}`)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all flex items-center gap-2">
                              {isStarted ? "Lanjutkan" : "Mulai"} <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-16 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
                <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">search_off</span>
                <p className="text-slate-800 font-bold text-lg mb-1">Modul tidak ditemukan</p>
                <p className="text-slate-500 text-sm">Coba gunakan kata kunci lain atau ubah filter status modul.</p>
              </div>
            )}
          </div>

          {/* Kontrol Pagination Tersembunyi Jika Halaman <= 1 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <span className="text-sm text-slate-500 font-medium hidden sm:block">
                Menampilkan <span className="font-bold text-slate-800">{startIndex + 1}</span> - <span className="font-bold text-slate-800">{Math.min(startIndex + itemsPerPage, filteredModules.length)}</span> dari <span className="font-bold text-slate-800">{filteredModules.length}</span> modul
              </span>
              
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-all"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                
                <div className="flex items-center gap-1 px-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                        currentPage === i + 1 
                          ? "bg-emerald-600 text-white shadow-sm" 
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-all"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Motivasi */}
        <section className="bg-emerald-800 text-emerald-50 p-8 md:p-10 rounded-3xl relative overflow-hidden mt-10 shadow-lg">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full mb-4 border border-white/20 text-xs font-bold uppercase tracking-widest text-white">
              <span className="material-symbols-outlined text-[16px]">psychology_alt</span> Motivasi Hari Ini
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">Terus Tingkatkan Kompetensi Anda!</h3>
            <p className="text-emerald-100 mt-3 text-sm md:text-base leading-relaxed">
              Setiap modul yang Anda selesaikan bukan hanya sekadar nilai, melainkan bentuk nyata dari dedikasi Anda dalam menjaga standar kualitas dan keamanan operasional. Selesaikan kurikulum Anda dengan bangga dan jadilah inspirasi bagi rekan kerja di area Anda.
            </p>
          </div>
          
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-emerald-500/40 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 right-20 w-64 h-64 bg-emerald-900/50 rounded-full blur-2xl"></div>
          <span className="material-symbols-outlined absolute -right-10 top-1/2 -translate-y-1/2 text-[200px] text-white/5 pointer-events-none rotate-12">workspace_premium</span>
        </section>

      </div>
    </main>
  );
}
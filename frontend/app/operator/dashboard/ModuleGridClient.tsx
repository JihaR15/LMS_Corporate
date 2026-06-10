"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function ModuleGridClient({ modules }: { modules: any[] }) {
  const router = useRouter();
  const [testWarningModal, setTestWarningModal] = useState<any | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.length > 0 ? (
          modules.map((mod: any) => {
            // Hitung rasio materi yang selesai dibaca
            const materialRatio =
              mod.total_materials > 0
                ? mod.completed_materials / mod.total_materials
                : 0;

            const isTestPassed =
              mod.is_test_passed === true || mod.is_test_passed === 1;
            const isReadyForTest =
              materialRatio === 1 && !isTestPassed && mod.total_materials > 0;

            // Logika persentase progres UI
            let modulePercent = 0;
            if (isTestPassed) {
              modulePercent = 100;
            } else {
              // Jika belum lulus ujian, maksimal progres hanya mentok di 90%
              modulePercent = Math.round(materialRatio * 90);
            }

            return (
              <div
                key={mod.id}
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col hover:shadow-md transition-shadow group p-6 ${
                  isTestPassed ? "border-blue-200" : "border-slate-200"
                }`}
              >
                <div className="flex-1">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform ${
                      isTestPassed
                        ? "bg-blue-50"
                        : isReadyForTest
                          ? "bg-orange-50"
                          : "bg-emerald-50"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[28px] ${
                        isTestPassed
                          ? "text-blue-600"
                          : isReadyForTest
                            ? "text-orange-600"
                            : "text-emerald-600"
                      }`}
                    >
                      {isTestPassed
                        ? "workspace_premium"
                        : isReadyForTest
                          ? "quiz"
                          : "menu_book"}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-slate-800 mb-2 leading-snug">
                    {mod.title}
                  </h3>

                  <div className="flex items-center gap-3 mb-6 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">
                        fact_check
                      </span>
                      {mod.total_materials} Materi
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">
                        grade
                      </span>
                      Passing Score: {Math.round(mod.passing_score)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span
                        className={
                          isTestPassed ? "text-blue-600" : "text-slate-500"
                        }
                      >
                        {isTestPassed
                          ? "Sertifikasi Tuntas"
                          : "Progress Belajar"}
                      </span>
                      <span
                        className={
                          isTestPassed
                            ? "text-blue-600"
                            : isReadyForTest
                              ? "text-orange-600"
                              : "text-emerald-600"
                        }
                      >
                        {modulePercent}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isTestPassed
                            ? "bg-blue-500"
                            : isReadyForTest
                              ? "bg-orange-500"
                              : "bg-emerald-600"
                        }`}
                        style={{ width: `${modulePercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (isTestPassed) {
                      // Sudah tuntas, arahkan ke materi untuk review
                      router.push(`/operator/my-courses`);
                    } else if (isReadyForTest) {
                      // Siap Ujian
                      setTestWarningModal(mod);
                    } else {
                      // Masih Belajar
                      router.push(`/operator/learn/${mod.id}`);
                    }
                  }}
                  className={`mt-6 w-full font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all text-sm ${
                    isTestPassed
                      ? "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                      : isReadyForTest
                        ? "bg-orange-600 hover:bg-orange-700 text-white"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {isTestPassed
                    ? "Lihat Materi Saya"
                    : isReadyForTest
                      ? "Mulai Post-Test"
                      : "Lanjutkan Belajar"}
                  <span className="material-symbols-outlined text-[18px]">
                    {isTestPassed ? "visibility" : "arrow_forward"}
                  </span>
                </button>
              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
            Belum ada modul pelatihan yang ditugaskan untuk posisi jabatan Anda
            saat ini.
          </div>
        )}
      </div>

      {/* --- MODAL WARNING POST-TEST --- */}
      {testWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden p-6">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-orange-100">
              <span className="material-symbols-outlined text-orange-500 text-[32px]">
                warning
              </span>
            </div>

            <h3 className="text-xl font-bold text-center text-slate-800 mb-2">
              Konfirmasi Ujian
            </h3>
            <p className="text-sm text-center text-slate-500 mb-6 leading-relaxed">
              Anda akan memulai Post-Test untuk modul{" "}
              <strong>{testWarningModal.title}</strong>. Ujian ini memiliki
              batas waktu <strong className="text-slate-700">15 Menit</strong>.
              Pastikan Anda berada di tempat dengan koneksi yang stabil.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setTestWarningModal(null)}
                disabled={isNavigating}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                Kembali
              </button>
              <button
                onClick={() => {
                  setIsNavigating(true);
                  router.push(`/operator/learn/${testWarningModal.id}/test`);
                }}
                disabled={isNavigating}
                className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isNavigating ? "Memuat..." : "Mulai Ujian"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

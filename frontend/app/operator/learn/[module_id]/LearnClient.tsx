"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ModuleData {
  id: number;
  title: string;
  description: string;
}

interface MaterialData {
  id: number;
  title: string;
  type: string;
  file_url: string;
  sequence_order: number;
}

interface LearnClientProps {
  moduleData: ModuleData;
  materials: MaterialData[];
  completedMaterialIds: number[];
  token: string;
}

export default function LearnClient({
  moduleData,
  materials,
  completedMaterialIds: initialCompleted,
  token,
}: LearnClientProps) {
  const router = useRouter();

  const sortedMaterials = [...materials].sort(
    (a, b) => a.sequence_order - b.sequence_order,
  );
  const [completedIds, setCompletedIds] = useState<number[]>(initialCompleted);
  const [activeMaterialId, setActiveMaterialId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  useEffect(() => {
    if (sortedMaterials.length > 0) {
      const firstUncompleted = sortedMaterials.find(
        (m) => !completedIds.includes(m.id),
      );
      if (firstUncompleted) {
        setActiveMaterialId(firstUncompleted.id);
      } else {
        setActiveMaterialId(sortedMaterials[0].id);
      }
    }
  }, []);

  // Perbaikan bug sidebar: Jika activeMaterialId masih null (frame ke-1), gunakan ID materi pertama
  const currentActiveId = activeMaterialId || sortedMaterials[0]?.id;
  const activeMaterial = sortedMaterials.find((m) => m.id === currentActiveId);
  const currentIndex = sortedMaterials.findIndex(
    (m) => m.id === currentActiveId,
  );

  const progressPercentage =
    materials.length > 0
      ? Math.round((completedIds.length / materials.length) * 100)
      : 0;

  const handleComplete = async () => {
    if (!activeMaterial || isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 1. Tembak API Database Progress (Perhatikan tambahan /complete di akhir URL)
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/progress/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ material_id: activeMaterial.id }),
        },
      );

      if (res.ok) {
        // 2. Update layar UI jika berhasil tersimpan
        if (!completedIds.includes(activeMaterial.id)) {
          setCompletedIds([...completedIds, activeMaterial.id]);
        }

        // 3. Auto-next ke materi berikutnya
        if (currentIndex < sortedMaterials.length - 1) {
          setActiveMaterialId(sortedMaterials[currentIndex + 1].id);
        } else {
          setIsCompleteModalOpen(true);
        }

        router.refresh();
      } else {
        // Pengecekan aman agar tidak crash jika balasan server bukan JSON
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await res.json();
          alert(errorData.message || "Gagal mencatat progress");
        } else {
          console.error(
            "Server merespons dengan tipe data non-JSON:",
            await res.text(),
          );
          alert("Gagal menghubungi server. Endpoint mungkin salah.");
        }
      }
    } catch (error) {
      console.error("Terjadi error di fungsi handleComplete:", error);
      alert("Terjadi kesalahan sistem saat menghubungi server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (!activeMaterial) return;
    if (currentIndex > 0) {
      setActiveMaterialId(sortedMaterials[currentIndex - 1].id);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 shadow-sm h-14 flex flex-col justify-center relative z-40">
        <div className="px-6 flex justify-between items-center w-full">
          <button
            onClick={() => router.push("/operator/dashboard")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-all text-emerald-700 text-sm font-semibold"
          >
            <span className="material-symbols-outlined text-[20px]">
              arrow_back
            </span>
            <span className="hidden sm:block">Kembali</span>
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 text-center hidden md:block w-1/2">
            <h1 className="font-bold text-slate-800 truncate">
              {moduleData.title}
            </h1>
          </div>

          <div className="w-25 hidden sm:block"></div>
        </div>

        <div className="w-full bg-slate-100 h-1 absolute bottom-0 left-0">
          <div
            className="bg-emerald-600 h-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </nav>

      <main className="flex flex-col lg:flex-row flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6 gap-6">
        <section className="lg:w-[70%] flex flex-col gap-6">
          {/* MEDIA PLAYER (FIXED 16:9 UNTUK SEMUA TIPE) */}
          <div className="aspect-video w-full bg-slate-900 relative rounded-xl overflow-hidden shadow-lg flex items-center justify-center border border-slate-800">
            {activeMaterial ? (
              activeMaterial.type === "pdf" ? (
                <object
                  data={`${process.env.NEXT_PUBLIC_API_URL}${activeMaterial.file_url}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                  type="application/pdf"
                  className="w-full h-full bg-slate-100"
                >
                  <div className="flex flex-col items-center justify-center p-6 text-center h-full bg-slate-50">
                    <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">
                      picture_as_pdf
                    </span>
                    <p className="text-sm text-slate-600 mb-4">
                      Browser Anda tidak mendukung pratinjau PDF langsung.
                    </p>
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL}${activeMaterial.file_url}`}
                      download
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold"
                    >
                      Unduh Dokumen PDF
                    </a>
                  </div>
                </object>
              ) : (
                <video
                  src={`${process.env.NEXT_PUBLIC_API_URL}${activeMaterial.file_url}`}
                  controls
                  controlsList="nodownload"
                  className="w-full h-full object-contain bg-black"
                />
              )
            ) : (
              <div className="text-slate-500 text-sm">
                Tidak ada materi yang aktif.
              </div>
            )}
          </div>

          {activeMaterial && (
            <div className="flex flex-col gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-10">
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 uppercase ${
                    activeMaterial.type === "pdf"
                      ? "bg-red-50 text-red-600"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {activeMaterial.type === "pdf"
                      ? "picture_as_pdf"
                      : "play_circle"}
                  </span>
                  {activeMaterial.type}
                </span>
                <span className="text-slate-400 text-xs font-medium">
                  Urutan ke-{activeMaterial.sequence_order}
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-800">
                {activeMaterial.title}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Materi ini adalah bagian dari modul "{moduleData.title}".
                Pastikan Anda mempelajari seluruh instruksi keselamatan dan
                standar operasional yang tertera.
              </p>

              <div
                className={`flex flex-col sm:flex-row items-center mt-6 pt-6 border-t border-slate-100 gap-4 ${
                  currentIndex > 0 ? "justify-between" : "justify-end"
                }`}
              >
                {currentIndex > 0 && (
                  <button
                    onClick={handlePrevious}
                    className="w-full sm:w-auto px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold text-sm rounded-lg flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      chevron_left
                    </span>
                    Materi Sebelumnya
                  </button>
                )}

                <button
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-2.5 bg-emerald-600 text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 shadow-sm hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Menyimpan..."
                    : completedIds.includes(activeMaterial.id)
                      ? "Lanjut ke Materi Berikutnya"
                      : "Tandai Selesai & Lanjut"}
                  <span className="material-symbols-outlined text-[18px]">
                    {completedIds.includes(activeMaterial.id)
                      ? "arrow_forward"
                      : "check_circle"}
                  </span>
                </button>
              </div>
            </div>
          )}
        </section>

        <aside className="lg:w-[30%] flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4 h-fit sticky top-20">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-slate-800">
                Daftar Materi
              </h3>
              <p className="text-xs font-bold text-emerald-600">
                {completedIds.length} dari {materials.length} materi
                diselesaikan
              </p>
            </div>

            <div className="flex flex-col gap-2 mt-2 max-h-[60vh] overflow-y-auto pr-2">
              {materials.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  Belum ada materi untuk modul ini.
                </p>
              ) : (
                sortedMaterials.map((mat, index) => {
                  const isCompleted = completedIds.includes(mat.id);
                  const isActive = currentActiveId === mat.id;

                  const isUnlocked =
                    isCompleted ||
                    isActive ||
                    index === 0 ||
                    completedIds.includes(sortedMaterials[index - 1].id);

                  return (
                    <div
                      key={mat.id}
                      onClick={() => isUnlocked && setActiveMaterialId(mat.id)}
                      className={`flex items-center gap-3 p-3.5 rounded-lg border transition-all ${
                        isActive
                          ? "bg-white border-emerald-500 shadow-sm ring-1 ring-emerald-500 cursor-pointer"
                          : isCompleted
                            ? "bg-emerald-50/50 border-emerald-100 hover:bg-emerald-50 cursor-pointer"
                            : isUnlocked
                              ? "bg-white border-slate-200 hover:border-emerald-300 cursor-pointer"
                              : "bg-slate-50 border-transparent opacity-60 grayscale cursor-not-allowed"
                      }`}
                    >
                      <div
                        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? "bg-emerald-100 text-emerald-600"
                            : isActive
                              ? "bg-emerald-600 text-white"
                              : isUnlocked
                                ? "bg-slate-100 text-slate-500"
                                : "bg-slate-200 text-slate-400"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {isCompleted
                            ? "check"
                            : isActive
                              ? "play_arrow"
                              : isUnlocked
                                ? "play_arrow"
                                : "lock"}
                        </span>
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span
                          className={`text-sm truncate ${isActive ? "font-bold text-slate-800" : isCompleted ? "font-medium text-slate-700" : "font-medium text-slate-600"}`}
                        >
                          {mat.title}
                        </span>
                        <span
                          className={`text-[10px] font-bold ${
                            isActive
                              ? "text-emerald-600"
                              : isCompleted
                                ? "text-emerald-500"
                                : "text-slate-400"
                          }`}
                        >
                          {isCompleted
                            ? "SELESAI"
                            : isActive
                              ? "SEDANG DIPELAJARI"
                              : isUnlocked
                                ? "TERSEDIA"
                                : "TERKUNCI"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </aside>
      </main>
{/* MODAL PERAYAAN SELESAI MODUL */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-100 flex items-center justify-center transition-all duration-300 ${
          isCompleteModalOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div
          className={`bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 ${
            isCompleteModalOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-8"
          }`}
        >
          <div className="p-8 flex flex-col items-center text-center">
            {/* Ikon Perayaan */}
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-5 border-[6px] border-emerald-100/50">
              <span className="material-symbols-outlined text-emerald-600 text-[40px]">
                emoji_events
              </span>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Luar Biasa!</h2>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              Anda telah menyelesaikan seluruh materi pada modul <strong className="text-slate-700">{moduleData.title}</strong>. Terus pertahankan performa Anda!
            </p>
            
            <button
              onClick={() => router.push("/operator/dashboard")}
              className="w-full py-3.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              Kembali ke Dashboard
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useState, useEffect } from "react";

export interface MaterialData {
  id: number;
  module_id: number;
  title: string;
  type: string;
  file_url: string;
  sequence_order: number;
}

interface ViewMaterialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  moduleId: number | null;
  moduleTitle: string;
  materialRefreshKey: number;
  onOpenUpload: (id: number) => void;
  onMaterialCountChange: (moduleId: number, count: number) => void;
  // Prop baru untuk menangkap aksi Edit
  onEditMaterial?: (material: MaterialData) => void; 
}

export default function ViewMaterialsModal({
  isOpen,
  onClose,
  token,
  moduleId,
  moduleTitle,
  materialRefreshKey,
  onOpenUpload,
  onMaterialCountChange,
  onEditMaterial,
}: ViewMaterialsModalProps) {
  const [materials, setMaterials] = useState<MaterialData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewItem, setPreviewItem] = useState<MaterialData | null>(null);

  // State Reorder
  const [hasChanged, setHasChanged] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  useEffect(() => {
    if (isOpen && moduleId && token) {
      setIsLoading(true);
      setMaterials([]);
      setPreviewItem(null);
      setHasChanged(false);
      fetchMaterials();
    }
  }, [isOpen, moduleId, token, materialRefreshKey]);

  const fetchMaterials = async () => {
    if (!moduleId || !token) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/materials/module/${moduleId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();
      if (response.ok) {
        // Pastikan terurut berdasarkan sequence_order saat dimuat
        const data = (result.data || []).sort((a: MaterialData, b: MaterialData) => a.sequence_order - b.sequence_order);
        setMaterials(data);
        onMaterialCountChange(moduleId, data.length);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIKA REORDER (TUKAR POSISI) ---
  const moveItem = (index: number, direction: "up" | "down") => {
    const newMaterials = [...materials];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newMaterials.length) return;

    // Tukar posisi di array lokal
    [newMaterials[index], newMaterials[targetIndex]] = [newMaterials[targetIndex], newMaterials[index]];

    setMaterials(newMaterials);
    setHasChanged(true);
  };

  const handleSaveOrder = async () => {
    setIsSavingOrder(true);
    const ordered_ids = materials.map((m) => m.id);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/materials/reorder`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ordered_ids }),
      });

      if (res.ok) {
        setHasChanged(false);
        fetchMaterials(); // Reload untuk mendapatkan sequence_order terbaru dari DB
      } else {
        const err = await res.json();
        alert(err.message || "Gagal menyimpan urutan");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem saat menyimpan urutan.");
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleDeleteMaterial = async (id: number) => {
    if (!confirm("Yakin ingin menghapus materi ini? File akan terhapus permanen.")) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/materials/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const result = await response.json();
      if (response.ok) {
        const updated = materials.filter((m) => m.id !== id);
        setMaterials(updated);
        if (previewItem && previewItem.id === id) setPreviewItem(null);
        if (moduleId) onMaterialCountChange(moduleId, updated.length);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // --- SMART URL HELPER (Anti Double Slash) ---
  const getRenderUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url; 
    }
    // Bersihkan slash di akhir API URL jika ada
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.endsWith("/") 
      ? process.env.NEXT_PUBLIC_API_URL.slice(0, -1) 
      : process.env.NEXT_PUBLIC_API_URL;
      
    // Pastikan path lokal diawali dengan satu slash
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    
    return `${baseUrl}${cleanUrl}`; 
  };

  const isYouTubeUrl = (url: string) => {
    if (!url) return false;
    return url.includes("youtube.com") || url.includes("youtu.be");
  };

  const getYouTubeEmbedUrl = (url: string) => {
    return url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-100 flex items-center justify-center transition-all duration-300">
      <div className={`bg-white w-full rounded-2xl shadow-2xl overflow-hidden transform scale-100 translate-y-0 transition-all duration-300 ${
        previewItem ? "max-w-6xl" : "max-w-3xl"
      }`}>
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Manajemen Materi Modul</h2>
            <p className="text-xs text-slate-500 mt-0.5">{moduleTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-red-50"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className={`p-6 flex flex-col md:flex-row gap-6 ${previewItem ? "h-125" : "h-auto max-h-[70vh]"}`}>
          
          <div className={`flex-1 flex flex-col min-w-0 ${previewItem ? "md:max-w-md border-r border-slate-100 pr-4" : ""}`}>
            <div className="flex justify-between items-center mb-6 gap-2">
              <h3 className="font-bold text-sm text-slate-700">
                Daftar Materi ({isLoading ? "..." : materials.length})
              </h3>
              <div className="flex gap-2">
                {hasChanged && (
                  <button
                    onClick={handleSaveOrder}
                    disabled={isSavingOrder}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 border border-orange-200 rounded-lg text-xs font-bold hover:bg-orange-200 transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    {isSavingOrder ? "Menyimpan..." : "Simpan Urutan"}
                  </button>
                )}
                <button
                  onClick={() => {
                    if (moduleId) onOpenUpload(moduleId);
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all active:scale-95 shrink-0 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Tambah
                </button>
              </div>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
                  <p className="text-xs font-medium text-slate-500">Memuat rincian materi...</p>
                </div>
              ) : materials.length > 0 ? (
                materials.map((mat, index) => (
                  <div
                    key={mat.id}
                    onClick={() => setPreviewItem(mat)}
                    className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all group ${
                      previewItem?.id === mat.id
                        ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500"
                        : mat.type === "pdf"
                        ? "border-slate-200 bg-white hover:border-red-300 hover:bg-red-50/20"
                        : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/20"
                    }`}
                  >
                    {/* INFO MATERI KIRI */}
                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                      {mat.type === "pdf" ? (
                        <div className="w-10 h-10 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center text-red-500 shrink-0">
                          <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center text-blue-500 shrink-0">
                          <span className="material-symbols-outlined text-[20px]">smart_display</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs text-slate-800 truncate" title={mat.title}>
                          {mat.title}
                        </p>
                        <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                          {mat.file_url.startsWith("http") ? "Link Eksternal" : "File Lokal"}
                        </p>
                      </div>
                    </div>

                    {/* AKSI KANAN (Panah, Edit, Hapus) */}
                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0 bg-white/80 p-1 rounded-lg backdrop-blur-sm">
                      <button
                        onClick={(e) => { e.stopPropagation(); moveItem(index, "up"); }}
                        disabled={index === 0}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Naikkan Urutan"
                      >
                        <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); moveItem(index, "down"); }}
                        disabled={index === materials.length - 1}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Turunkan Urutan"
                      >
                        <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                      </button>
                      <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if(onEditMaterial) onEditMaterial(mat); 
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                        title="Edit Materi"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMaterial(mat.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                        title="Hapus Materi"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                    
                    {/* Tampilan Nomor Urut saat tidak di-hover */}
                    <div className="w-6 text-right md:group-hover:hidden transition-all text-xs font-bold text-slate-300">
                      #{index + 1}
                    </div>

                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[24px] text-slate-400">
                      folder_open
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-700">Modul Kosong</h4>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-50">Tambahkan materi PDF, Video, atau Link URL untuk memulai.</p>
                </div>
              )}
            </div>
          </div>

          {/* AREA PREVIEW KANAN */}
          {previewItem && (
            <div className="flex-2 flex flex-col min-w-0 h-full bg-slate-900 rounded-2xl overflow-hidden shadow-inner border border-slate-800 relative">
              <div className="absolute top-3 left-3 z-10 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 max-w-[calc(100%-24px)] flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${previewItem.type === 'pdf' ? 'bg-red-500' : 'bg-blue-500 animate-pulse'}`}></span>
                <span className="text-xs font-bold text-slate-200 truncate">{previewItem.title}</span>
              </div>
              
              <div className="w-full h-full pt-12 pb-2 px-2 flex items-center justify-center bg-slate-950">
                {previewItem.type === "pdf" ? (
                  // PDF RENDERER
                  <iframe
                    key={`pdf-${previewItem.id}`}
                    src={getRenderUrl(previewItem.file_url) + (previewItem.file_url.startsWith("http") ? "" : "#toolbar=0&navpanes=0")}
                    className="w-full h-full border-none rounded-xl bg-white"
                    title={previewItem.title}
                  />
                ) : isYouTubeUrl(previewItem.file_url) ? (
                  // YOUTUBE RENDERER
                  <iframe 
                    key={`yt-${previewItem.id}`}
                    src={getYouTubeEmbedUrl(previewItem.file_url)} 
                    className="w-full h-full border-none rounded-xl"
                    allowFullScreen
                    title={previewItem.title}
                  />
                ) : (
                  // VIDEO LOKAL RENDERER
                  <video
                    key={`vid-${previewItem.id}`}
                    src={getRenderUrl(previewItem.file_url)}
                    controls
                    controlsList="nodownload"
                    className="w-full max-h-full object-contain rounded-xl"
                  />
                )}
              </div>
            </div>
          )}

        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          {previewItem && (
            <button
              onClick={() => setPreviewItem(null)}
              className="px-5 py-2.5 border border-slate-300 bg-white text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all"
            >
              Tutup Pratinjau
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900 shadow-md transition-all active:scale-95"
          >
            Selesai & Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
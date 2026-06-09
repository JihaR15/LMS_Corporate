"use client";
import React, { useState, useEffect } from "react";

interface MaterialData {
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
}: ViewMaterialsModalProps) {
  const [materials, setMaterials] = useState<MaterialData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewItem, setPreviewItem] = useState<MaterialData | null>(null);

  useEffect(() => {
    if (isOpen && moduleId && token) {
      setIsLoading(true);
      setMaterials([]);
      setPreviewItem(null);
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
        const data = result.data || [];
        setMaterials(data);
        onMaterialCountChange(moduleId, data.length);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMaterial = async (id: number) => {
    if (!confirm("Yakin ingin menghapus materi ini?")) return;

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-100 flex items-center justify-center transition-all duration-300">
      <div className={`bg-white w-full rounded-2xl shadow-2xl overflow-hidden transform scale-100 translate-y-0 transition-all duration-300 ${
        previewItem ? "max-w-5xl" : "max-w-2xl"
      }`}>
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Materi Modul</h2>
            <p className="text-xs text-slate-500 mt-0.5">{moduleTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className={`p-6 flex flex-col md:flex-row gap-6 ${previewItem ? "h-130" : "h-auto"}`}>
          
          <div className={`flex-1 flex flex-col min-w-0 ${previewItem ? "md:max-w-sm border-r border-slate-100 pr-4" : ""}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-sm text-slate-700">
                Daftar Materi ({isLoading ? "..." : materials.length})
              </h3>
              <button
                onClick={() => {
                  if (moduleId) onOpenUpload(moduleId);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-all active:scale-95 shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Unggah</span>
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 pr-1 max-h-87.5">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
                  <p className="text-xs font-medium text-slate-500">Memuat rincian materi...</p>
                </div>
              ) : materials.length > 0 ? (
                materials.map((mat) => (
                  <div
                    key={mat.id}
                    onClick={() => setPreviewItem(mat)}
                    className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition-all ${
                      previewItem?.id === mat.id
                        ? "border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500"
                        : mat.type === "pdf"
                        ? "border-slate-200 bg-white hover:border-red-300 hover:bg-red-50/10"
                        : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/10"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {mat.type === "pdf" ? (
                        <div className="w-9 h-9 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center text-red-600 shrink-0">
                          <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                        </div>
                      ) : (
                        <div className="w-9 h-9 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                          <span className="material-symbols-outlined text-[20px]">play_circle</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs text-slate-800 truncate">
                          {mat.title}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Urutan: {mat.sequence_order}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMaterial(mat.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all flex items-center justify-center ml-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[28px] text-slate-400">
                      description
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-700">Belum ada materi</h4>
                </div>
              )}
            </div>
          </div>

          {previewItem && (
            <div className="flex-1 flex flex-col min-w-0 h-full bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-800 relative">
              <div className="absolute top-3 left-3 z-10 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 max-w-[calc(100%-24px)] flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${previewItem.type === 'pdf' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                <span className="text-xs font-medium text-slate-200 truncate">{previewItem.title}</span>
              </div>
              
              <div className="w-full h-full pt-12 flex items-center justify-center bg-slate-950">
                {previewItem.type === "pdf" ? (
                  <iframe
                    src={`${process.env.NEXT_PUBLIC_API_URL}${previewItem.file_url}#toolbar=0&navpanes=0`}
                    className="w-full h-full border-none"
                    title={previewItem.title}
                  />
                ) : (
                  <video
                    src={`${process.env.NEXT_PUBLIC_API_URL}${previewItem.file_url}`}
                    controls
                    controlsList="nodownload"
                    className="w-full max-h-full object-contain"
                  />
                )}
              </div>
            </div>
          )}

        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          {previewItem && (
            <button
              onClick={() => setPreviewItem(null)}
              className="px-4 py-2 border border-slate-300 bg-white text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-all"
            >
              Tutup Pratinjau
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-300 transition-all"
          >
            Tutup Modal
          </button>
        </div>
      </div>
    </div>
  );
}
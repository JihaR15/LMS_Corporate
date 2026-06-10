"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ModuleFormModal from "./ModuleFormModal";
import UploadMaterialModal from "./UploadMaterialModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import ViewMaterialsModal from "./ViewMaterialsModal";
import { MaterialData } from "./ViewMaterialsModal"; // Pastikan import MaterialData

interface ModuleData {
  id: number;
  title: string;
  description: string;
  passing_score: number;
  position_id: number;
  position_name: string | null;
  materi_count?: number;
}

interface PositionData {
  id: number;
  name: string;
}

interface ModuleClientProps {
  initialModules: ModuleData[];
  initialPositions: PositionData[];
  token: string;
}

export default function ModuleClient({
  initialModules,
  initialPositions,
  token,
}: ModuleClientProps) {
  const router = useRouter();

  // --- STATE MODALS ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // --- STATE DATA ---
  const [modules, setModules] = useState<ModuleData[]>(initialModules);
  const [positions] = useState<PositionData[]>(initialPositions);

  const [editModule, setEditModule] = useState<ModuleData | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [uploadModuleId, setUploadModuleId] = useState<number | null>(null);
  const [viewModule, setViewModule] = useState<ModuleData | null>(null);
  
  // State Baru untuk Data Edit Materi 
  const [editMaterialData, setEditMaterialData] = useState<MaterialData | null>(null);

  // --- STATE FILTER & SEARCH ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [materialRefreshKey, setMaterialRefreshKey] = useState(0);

  // --- HANDLER MODALS ---
  const handleOpenCreateModal = () => {
    setEditModule(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (mod: ModuleData) => {
    setEditModule(mod);
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (mod: ModuleData) => {
    setViewModule(mod);
    setIsViewModalOpen(true);
  };

  // Saat Tambah Materi dari View Modal
  const handleOpenUploadFromView = (id: number) => {
    setUploadModuleId(id);
    setEditMaterialData(null); // Pastikan state edit kosong (Mode Tambah)
    setIsUploadModalOpen(true);
  };

  // Saat Edit Materi dari View Modal
  const handleEditMaterial = (material: MaterialData) => {
    setUploadModuleId(material.module_id);
    setEditMaterialData(material); // Set data materi yang mau diedit
    setIsUploadModalOpen(true); // Buka modal upload (yang sekarang jadi pintar)
  };

  const handleOpenDeleteModal = (id: number) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // --- HANDLER SUCCESS ---
  const handleFormSuccess = (data: ModuleData, isEdit: boolean) => {
    if (isEdit) {
      setModules(
        modules.map((mod) =>
          mod.id === data.id
            ? {
                ...data,
                position_name:
                  positions.find((p) => p.id === data.position_id)?.name || null,
              }
            : mod
        )
      );
    } else {
      const newModule = {
        ...data,
        position_name:
          positions.find((p) => p.id === data.position_id)?.name || null,
        materi_count: 0,
      };
      setModules([newModule, ...modules]);
    }
  };

  const handleUploadSuccess = (moduleId: number, currentSequence: number) => {
    // Hanya tambah count jika ini mode "Tambah Baru", bukan mode "Edit"
    if (!editMaterialData) {
      setModules(
        modules.map((m) =>
          m.id === moduleId ? { ...m, materi_count: currentSequence } : m
        )
      );
      if (viewModule && viewModule.id === moduleId) {
        setViewModule({ ...viewModule, materi_count: currentSequence });
      }
    }
    
    // Refresh materi di ViewModal (agar data yang baru diedit atau ditambah muncul)
    setMaterialRefreshKey((prev) => prev + 1);
  };

  const handleMaterialCountUpdate = (moduleId: number, count: number) => {
    setModules(
      modules.map((m) => (m.id === moduleId ? { ...m, materi_count: count } : m))
    );
  };

  const handleDeleteSuccess = (id: number) => {
    setModules(modules.filter((mod) => mod.id !== id));
  };

  // --- LOGIKA FILTER ---
  const filteredModules = modules.filter((mod) => {
    const matchesSearch =
      mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (mod.description &&
        mod.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPosition =
      selectedPosition === "" || mod.position_id === parseInt(selectedPosition);

    return matchesSearch && matchesPosition;
  });

  const getTargetUploadSequence = () => {
    if (!uploadModuleId) return 1;
    const target = modules.find((m) => m.id === uploadModuleId);
    return target?.materi_count ? target.materi_count + 1 : 1;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Manajemen Modul Pelatihan
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola kurikulum dan standar kompetensi untuk setiap posisi jabatan.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all active:scale-95 shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Tambah Modul Baru</span>
        </button>
      </div>

      {/* Bar Pencarian & Filter */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm flex flex-wrap items-center gap-4 border border-slate-200">
        <div className="flex-1 min-w-60 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama modul..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-white text-slate-700 placeholder:text-slate-400 rounded-lg text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
        <div className="w-48 relative">
          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            className="w-full pl-3 pr-10 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm appearance-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none cursor-pointer transition-all"
          >
            <option value="">Semua Posisi</option>
            {positions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            expand_more
          </span>
        </div>
      </div>

      {/* Tabel Modul */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Nama Modul
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Posisi Jabatan
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                  KKM
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                  Jumlah Materi
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredModules.length > 0 ? (
                filteredModules.map((mod) => (
                  <tr
                    key={mod.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-5 max-w-[320px]">
                      <p
                        className="font-semibold text-slate-800 leading-tight truncate"
                        title={mod.title}
                      >
                        {mod.title}
                      </p>
                      <p
                        className="text-xs text-slate-500 mt-1 line-clamp-2"
                        title={mod.description}
                      >
                        {mod.description || "-"}
                      </p>
                    </td>

                    <td className="px-6 py-5 max-w-45">
                      <span
                        className="inline-block max-w-full truncate px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[11px] font-bold"
                        title={mod.position_name || "Semua Posisi"}
                      >
                        {mod.position_name || "Semua Posisi"}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-center font-mono text-sm font-semibold text-slate-700">
                      {mod.passing_score?.toFixed(2)}
                    </td>

                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-slate-600 font-medium">
                        <span className="material-symbols-outlined text-[18px] text-blue-500">
                          description
                        </span>
                        <span>{mod.materi_count || 0}</span>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        {/* Tombol Kelola Kuis */}
                        <button
                          onClick={() => router.push(`/admin/modules/${mod.id}/quiz`)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Kelola Kuis (Post-Test)"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            quiz
                          </span>
                        </button>
                        
                        {/* Tombol Kelola Materi */}
                        <button
                          onClick={() => handleOpenViewModal(mod)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Kelola Materi"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            list_alt
                          </span>
                        </button>

                        {/* Tombol Edit Modul */}
                        <button
                          onClick={() => handleOpenEditModal(mod)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                          title="Edit Modul"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            edit
                          </span>
                        </button>

                        {/* Tombol Hapus Modul */}
                        <button
                          onClick={() => handleOpenDeleteModal(mod.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Hapus Modul"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">folder_off</span>
                      <p className="text-slate-500 font-medium">Belum ada data modul yang ditemukan.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODALS --- */}
      <ModuleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        token={token}
        editModule={editModule}
        positions={positions}
        onSuccess={handleFormSuccess}
      />

      <UploadMaterialModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setEditMaterialData(null); // Reset saat ditutup
        }}
        token={token}
        moduleId={uploadModuleId}
        currentSequence={getTargetUploadSequence()}
        onSuccess={handleUploadSuccess}
        editData={editMaterialData} // Kirim data materi ke form
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        token={token}
        deleteId={deleteId}
        onSuccess={handleDeleteSuccess}
      />

      <ViewMaterialsModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewModule(null);
        }}
        token={token}
        moduleId={viewModule?.id || null}
        moduleTitle={viewModule?.title || ""}
        materialRefreshKey={materialRefreshKey}
        onOpenUpload={handleOpenUploadFromView}
        onMaterialCountChange={handleMaterialCountUpdate}
        onEditMaterial={handleEditMaterial}
      />
    </div>
  );
}
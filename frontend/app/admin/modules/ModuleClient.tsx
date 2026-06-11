"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ModuleFormModal from "./ModuleFormModal";
import UploadMaterialModal from "./UploadMaterialModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import ViewMaterialsModal from "./ViewMaterialsModal";
import { MaterialData } from "./ViewMaterialsModal";

interface ModuleData {
  id: number;
  title: string;
  description: string;
  passing_score: number;
  position_id: number;
  position_name: string | null;
  materi_count?: number;
  completed_users?: number;
  total_users?: number;
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
  const [editMaterialData, setEditMaterialData] = useState<MaterialData | null>(
    null,
  );

  // --- STATE FILTER, SEARCH & PAGINATION ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [materialRefreshKey, setMaterialRefreshKey] = useState(0);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const handleOpenUploadFromView = (id: number) => {
    setUploadModuleId(id);
    setEditMaterialData(null);
    setIsUploadModalOpen(true);
  };

  const handleEditMaterial = (material: MaterialData) => {
    setUploadModuleId(material.module_id);
    setEditMaterialData(material);
    setIsUploadModalOpen(true);
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
                  positions.find((p) => p.id === data.position_id)?.name ||
                  null,
              }
            : mod,
        ),
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
    if (!editMaterialData) {
      setModules(
        modules.map((m) =>
          m.id === moduleId ? { ...m, materi_count: currentSequence } : m,
        ),
      );
      if (viewModule && viewModule.id === moduleId) {
        setViewModule({ ...viewModule, materi_count: currentSequence });
      }
    }
    setMaterialRefreshKey((prev) => prev + 1);
  };

  const handleMaterialCountUpdate = (moduleId: number, count: number) => {
    setModules(
      modules.map((m) =>
        m.id === moduleId ? { ...m, materi_count: count } : m,
      ),
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

  // --- LOGIKA PAGINATION ---
  const totalPages = Math.ceil(filteredModules.length / itemsPerPage);
  const currentItems = filteredModules.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getTargetUploadSequence = () => {
    if (!uploadModuleId) return 1;
    const target = modules.find((m) => m.id === uploadModuleId);
    return target?.materi_count ? target.materi_count + 1 : 1;
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Manajemen Modul Pelatihan
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola kurikulum dan standar kompetensi untuk setiap posisi jabatan.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all active:scale-95 shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Tambah Modul Baru</span>
        </button>
      </div>

      {/* Bar Pencarian & Filter */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm flex flex-wrap sm:flex-nowrap items-center gap-4 border border-slate-200">
        <div className="flex-1 min-w-[200px] relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari berdasarkan nama modul..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 rounded-xl text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
        <div className="w-full sm:w-64 relative">
          <select
            value={selectedPosition}
            onChange={(e) => {
              setSelectedPosition(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-4 pr-10 py-2.5 border border-slate-200 bg-slate-50 text-slate-800 rounded-xl text-sm appearance-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none cursor-pointer transition-all font-medium"
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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Nama Modul
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                  Materi
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Statistik Kelulusan
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentItems.length > 0 ? (
                currentItems.map((mod, index) => {
                  // Simulasi Data Progres (Akan diganti dengan data asli dari Backend nanti)
                  const completed = mod.completed_users || 0;
                  const total = mod.total_users || 0;
                  const progressPct =
                    total > 0 ? Math.round((completed / total) * 100) : 0;

                  return (
                    <tr
                      key={mod.id}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      <td className="px-6 py-5 text-sm font-medium text-slate-400">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>

                      <td className="px-6 py-5 max-w-[300px]">
                        <p
                          className="font-bold text-slate-800 leading-tight truncate"
                          title={mod.title}
                        >
                          {mod.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="inline-block truncate px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-wider"
                            title={mod.position_name || "Semua Posisi"}
                          >
                            {mod.position_name || "GLOBAL"}
                          </span>
                          <span className="text-xs font-mono text-slate-400 font-semibold">
                            KKM: {mod.passing_score}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold text-xs border border-blue-100">
                          <span className="material-symbols-outlined text-[16px]">
                            description
                          </span>
                          {mod.materi_count || 0}
                        </div>
                      </td>

                      {/* KOLOM PROGRESS BARU */}
                      <td className="px-6 py-5">
                        <div className="w-full max-w-[140px]">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[11px] font-bold text-slate-600">
                              {completed} / {total} Lulus
                            </span>
                            <span className="text-[11px] font-bold text-emerald-600">
                              {progressPct}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all"
                              style={{ width: `${progressPct}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              router.push(`/admin/modules/${mod.id}/quiz`)
                            }
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Kelola Kuis (Post-Test)"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              quiz
                            </span>
                          </button>

                          <button
                            onClick={() => handleOpenViewModal(mod)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Kelola Materi"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              list_alt
                            </span>
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(mod)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                            title="Edit Modul Info"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              edit
                            </span>
                          </button>

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
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">
                        folder_off
                      </span>
                      <p className="text-slate-500 font-medium">
                        Belum ada data modul yang ditemukan.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <p className="text-sm text-slate-500">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{" "}
            {Math.min(currentPage * itemsPerPage, filteredModules.length)} dari{" "}
            {filteredModules.length}
          </p>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="w-8 h-8 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">
                chevron_left
              </span>
            </button>
            <span className="w-8 h-8 flex items-center justify-center rounded bg-emerald-600 text-white font-bold text-sm">
              {currentPage}
            </span>
            <button
              disabled={currentPage >= totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="w-8 h-8 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">
                chevron_right
              </span>
            </button>
          </div>
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
          setEditMaterialData(null);
        }}
        token={token}
        moduleId={uploadModuleId}
        currentSequence={getTargetUploadSequence()}
        onSuccess={handleUploadSuccess}
        editData={editMaterialData}
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

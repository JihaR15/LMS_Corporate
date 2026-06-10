"use client";
import React, { useState } from "react";
import PositionFormModal from "./PositionFormModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

export interface PositionData {
  id: number;
  name: string;
  user_count: number;
  module_count: number;
}

export default function PositionsClient({
  initialPositions,
  token,
}: {
  initialPositions: PositionData[];
  token: string;
}) {
  const [positions, setPositions] = useState<PositionData[]>(initialPositions);
  const [searchQuery, setSearchQuery] = useState("");

  // States Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [editData, setEditData] = useState<PositionData | null>(null);
  const [deleteData, setDeleteData] = useState<PositionData | null>(null);

  const filteredPositions = positions.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleOpenCreate = () => {
    setEditData(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (pos: PositionData) => {
    setEditData(pos);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (pos: PositionData) => {
    setDeleteData(pos);
    setIsDeleteOpen(true);
  };

  const handleFetchUpdate = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/positions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const result = await res.json();
        setPositions(result.data || []);
      }
    } catch (error) {
      console.error("Gagal memuat ulang data posisi");
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPositions.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredPositions.length / itemsPerPage);
  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-slate-800 leading-tight">
            Manajemen Posisi
          </h1>
          <p className="text-slate-500 mt-1">
            Kelola daftar jabatan dan departemen karyawan dalam ekosistem LMS.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
        >
          <span className="material-symbols-outlined font-bold text-[20px]">
            add
          </span>
          Tambah Posisi
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari posisi atau jabatan..."
          className="w-full pl-10 pr-4 py-3 text-slate-600 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all outline-none text-sm shadow-sm"
        />
      </div>

      {/* Data Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  No.
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Nama Posisi
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Karyawan
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Modul
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentItems.length > 0 ? (
                currentItems.map((pos, index) => (
                  <tr
                    key={pos.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-400">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-base font-semibold text-slate-800">
                        {pos.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="material-symbols-outlined text-[20px]">
                          group
                        </span>
                        <span className="text-sm">
                          {pos.user_count || 0} Karyawan
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="material-symbols-outlined text-[20px]">
                          menu_book
                        </span>
                        <span className="text-sm">
                          {pos.module_count || 0} Modul
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(pos)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Posisi"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            edit
                          </span>
                        </button>
                        <button
                          onClick={() => handleOpenDelete(pos)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Posisi"
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
                    className="px-6 py-12 text-center text-slate-500 text-sm"
                  >
                    Tidak ada data posisi yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            <span className="text-sm text-slate-500">
              Menampilkan {indexOfFirstItem + 1} -{" "}
              {Math.min(indexOfLastItem, filteredPositions.length)} dari{" "}
              {filteredPositions.length} posisi
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 font-semibold text-emerald-600">
                {currentPage}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <PositionFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        token={token}
        editData={editData}
        onSuccess={handleFetchUpdate}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        token={token}
        deleteData={deleteData}
        onSuccess={handleFetchUpdate}
      />
    </div>
  );
}

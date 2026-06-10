"use client";
import React, { useState } from "react";
import UserFormModal from "./UserFormModal";
import RaporModal from "./RaporModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

export interface UserData {
  id: number;
  nik: string;
  fullname: string;
  is_active: boolean;
  position_id: number;
  position_name: string;
}

export interface PositionData {
  id: number;
  name: string;
}

interface UsersClientProps {
  initialUsers: UserData[];
  positions: PositionData[];
  token: string;
}

export default function UsersClient({ initialUsers, positions, token }: UsersClientProps) {
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  
  // Filter & Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRaporOpen, setIsRaporOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // Handlers
  const handleFetchUpdate = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/operators`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        setUsers(result.data || []);
      }
    } catch (error) {
      console.error("Gagal refresh data");
    }
  };

  const openForm = (user: UserData | null = null) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const openRapor = (user: UserData) => {
    setSelectedUser(user);
    setIsRaporOpen(true);
  };

  const openDelete = (user: UserData) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  // Filter Logic
  const filteredUsers = users.filter((u) => {
    const matchSearch = u.fullname.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        u.nik.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPosition = selectedPosition === "" || u.position_id.toString() === selectedPosition;

    let matchStatus = true;
    if (statusFilter === 'active') matchStatus = u.is_active === true;
    if (statusFilter === 'inactive') matchStatus = u.is_active === false;

    return matchSearch && matchPosition && matchStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentItems = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Helper untuk inisial nama
  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Manajemen Pengguna</h1>
          <p className="text-slate-500 mt-1">Kelola akun karyawan dan pantau progres pembelajaran mereka.</p>
        </div>
        <button 
          onClick={() => openForm()}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 font-semibold"
        >
          <span className="material-symbols-outlined">person_add</span>
          Tambah Pengguna
        </button>
      </div>

      {/* Filter & Stats Bento */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4 w-full">
            <div className="relative flex-1 max-w-sm">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}}
                placeholder="Cari nama atau NIK..." 
                className="w-full text-slate-800 placeholder:text-slate-400 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>
            <div className="relative flex-1 max-w-xs">
              <select 
                value={selectedPosition}
                onChange={(e) => {setSelectedPosition(e.target.value); setCurrentPage(1);}}
                className="w-full text-slate-800 placeholder:text-slate-400 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none appearance-none cursor-pointer"
              >
                <option value="">Semua Jabatan</option>
                {positions.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
            </div>
            <div className="relative w-full sm:w-auto ">
              <select 
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as 'all' | 'active' | 'inactive'); 
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none cursor-pointer text-slate-800 appearance-none font-semibold"
              >
                <option value="active">Status: Aktif</option>
                <option value="inactive">Status: Nonaktif</option>
                <option value="all">Semua Status</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4 bg-emerald-600 text-white p-6 rounded-2xl shadow-sm flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-white/80 font-medium mb-1">Total Karyawan Aktif</p>
            <h3 className="text-4xl font-bold">{users.filter(u => u.is_active).length}</h3>
          </div>
          <span className="material-symbols-outlined text-[80px] absolute -right-4 -bottom-4 opacity-20 rotate-12">groups</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">No</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Karyawan</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Posisi / Jabatan</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status Akun</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentItems.length > 0 ? currentItems.map((u, index) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5 text-sm text-slate-500">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shrink-0">
                        {getInitials(u.fullname)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{u.fullname}</p>
                        <p className="text-xs font-mono text-slate-500 mt-0.5">NIK: {u.nik}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-full text-xs font-semibold">
                      {u.position_name || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    {u.is_active ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Aktif</span>
                    ) : (
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Nonaktif</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => openRapor(u)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Lihat Rapor Progress">
                        <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>analytics</span>
                      </button>
                      <button onClick={() => openForm(u)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Data">
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      {u.is_active && (
                        <button onClick={() => openDelete(u)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Nonaktifkan Akun">
                          <span className="material-symbols-outlined">person_off</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">Tidak ada data pengguna ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <p className="text-sm text-slate-500">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} dari {filteredUsers.length}
          </p>
          <div className="flex gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="w-8 h-8 flex items-center justify-center rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-700">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <span className="w-8 h-8 flex items-center justify-center rounded bg-emerald-600 text-white font-bold text-sm">{currentPage}</span>
            <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="w-8 h-8 flex items-center justify-center rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-700">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <UserFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} token={token} editData={selectedUser} positions={positions} onSuccess={handleFetchUpdate} />
      <DeleteConfirmModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} token={token} deleteData={selectedUser} onSuccess={handleFetchUpdate} />
      {selectedUser && <RaporModal isOpen={isRaporOpen} onClose={() => setIsRaporOpen(false)} token={token} user={selectedUser} />}
    </div>
  );
}
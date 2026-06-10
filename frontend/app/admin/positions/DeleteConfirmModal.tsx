"use client";
import React, { useState } from "react";
import { PositionData } from "./PositionsClient";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  deleteData: PositionData | null;
  onSuccess: () => void;
}

export default function DeleteConfirmModal({ isOpen, onClose, token, deleteData, onSuccess }: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteData) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/positions/${deleteData.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const error = await res.json();
        alert(error.message || "Gagal menghapus posisi");
      }
    } catch (error) {
      alert("Kesalahan jaringan");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !deleteData) return null;

  const isBlockDelete = deleteData.user_count > 0 || deleteData.module_count > 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-50">
            <span className="material-symbols-outlined text-red-500 text-[32px]">warning</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Hapus Posisi?</h2>
          
          {isBlockDelete ? (
             <p className="text-red-500 text-sm mt-3 font-semibold bg-red-50 p-3 rounded-lg border border-red-100">
               Posisi ini tidak dapat dihapus karena masih digunakan oleh {deleteData.user_count} User dan {deleteData.module_count} Modul. Kosongkan terlebih dahulu!
             </p>
          ) : (
            <>
              <p className="text-slate-500 text-sm mt-3">
                Anda akan menghapus posisi <strong className="text-slate-700">{deleteData.name}</strong> secara permanen.
              </p>
              <div className="mt-4 bg-slate-50 rounded-xl p-3 flex justify-around border border-slate-100">
                <div className="text-center">
                  <span className="block text-xl font-bold text-slate-800">{deleteData.user_count}</span>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Karyawan</span>
                </div>
                <div className="w-px bg-slate-200 h-full"></div>
                <div className="text-center">
                  <span className="block text-xl font-bold text-slate-800">{deleteData.module_count}</span>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Modul</span>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-3">
          <button 
            onClick={onClose} 
            className="py-2.5 text-slate-600 font-semibold border border-slate-300 bg-white hover:bg-slate-50 rounded-xl transition-colors text-sm"
          >
            Batal
          </button>
          <button 
            onClick={handleDelete}
            disabled={isDeleting || isBlockDelete}
            className="py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:grayscale text-sm"
          >
            {isDeleting ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}
"use client";
import React, { useState } from "react";

export default function DeleteConfirmModal({ isOpen, onClose, token, deleteData, onSuccess }: any) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteData) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${deleteData.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        alert("Gagal menonaktifkan pengguna");
      }
    } catch (error) {
      alert("Kesalahan jaringan");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !deleteData) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-red-500 text-3xl">person_off</span>
        </div>
        <h2 className="text-xl font-bold text-slate-800">Nonaktifkan Akun?</h2>
        <p className="text-slate-500 text-sm mt-2">
          Anda akan menonaktifkan akses login untuk <strong>{deleteData.fullname}</strong>. Histori rapor dan nilai akan tetap tersimpan aman.
        </p>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors">Batal</button>
          <button onClick={handleDelete} disabled={isDeleting} className="flex-1 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50">
            {isDeleting ? "Memproses..." : "Nonaktifkan"}
          </button>
        </div>
      </div>
    </div>
  );
}
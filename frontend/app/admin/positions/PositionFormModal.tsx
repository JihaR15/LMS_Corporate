"use client";
import React, { useState, useEffect } from "react";
import { PositionData } from "./PositionsClient";

interface PositionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  editData: PositionData | null;
  onSuccess: () => void;
}

export default function PositionFormModal({ isOpen, onClose, token, editData, onSuccess }: PositionFormModalProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(editData ? editData.name : "");
    }
  }, [isOpen, editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const url = editData 
      ? `${process.env.NEXT_PUBLIC_API_URL}/positions/${editData.id}` 
      : `${process.env.NEXT_PUBLIC_API_URL}/positions`;
    const method = editData ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const error = await res.json();
        alert(error.message || "Terjadi kesalahan");
      }
    } catch (error) {
      alert("Kesalahan jaringan");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className={`px-6 py-6 border-b border-slate-100 ${editData ? 'bg-blue-600' : 'bg-emerald-600'}`}>
          <h2 className="text-xl font-bold text-white">{editData ? "Edit Posisi" : "Tambah Posisi Baru"}</h2>
          <p className="text-white/80 text-sm mt-1">{editData ? "Perbarui nama jabatan yang dipilih." : "Masukkan rincian posisi jabatan baru."}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Nama Posisi</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all outline-none font-medium text-slate-800" 
              placeholder="Contoh: Manager Operasional" 
            />
          </div>
          <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 text-slate-600 font-semibold border border-slate-200 bg-white hover:bg-slate-100 rounded-xl transition-colors text-sm"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`px-6 py-2.5 text-white font-semibold rounded-xl shadow-sm transition-all active:scale-95 text-sm disabled:opacity-50 ${editData ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Posisi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
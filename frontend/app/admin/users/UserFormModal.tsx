"use client";
import React, { useState, useEffect } from "react";
import { UserData, PositionData } from "./UsersClient";

export default function UserFormModal({
  isOpen,
  onClose,
  token,
  editData,
  positions,
  onSuccess,
}: any) {
  const [formData, setFormData] = useState({
    nik: "",
    fullname: "",
    password: "",
    position_id: "",
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData({
          nik: editData.nik,
          fullname: editData.fullname,
          password: "",
          position_id: editData.position_id.toString(),
          is_active: editData.is_active,
        });
      } else {
        setFormData({
          nik: "",
          fullname: "",
          password: "",
          position_id: "",
          is_active: true,
        });
      }
    }
  }, [isOpen, editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const url = editData
      ? `${process.env.NEXT_PUBLIC_API_URL}/users/${editData.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/users`;
    const method = editData ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
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
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">
            {editData ? "Edit Data Pengguna" : "Tambah Pengguna Baru"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:bg-slate-100 rounded-full p-1"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              NIK (Nomor Induk Karyawan)
            </label>
            <input
              type="text"
              required
              disabled={!!editData}
              value={formData.nik}
              onChange={(e) =>
                setFormData({ ...formData, nik: e.target.value })
              }
              className="w-full text-slate-800 placeholder:text-slate-400 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-60"
              placeholder="Contoh: OPR-001"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              value={formData.fullname}
              onChange={(e) =>
                setFormData({ ...formData, fullname: e.target.value })
              }
              className="w-full text-slate-800 placeholder:text-slate-400 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Masukkan nama lengkap"
            />
          </div>
          {!editData && (
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Password Awal
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full text-slate-800 placeholder:text-slate-400 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="••••••••"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Posisi / Jabatan
            </label>
            <select
              required
              value={formData.position_id}
              onChange={(e) =>
                setFormData({ ...formData, position_id: e.target.value })
              }
              className="w-full text-slate-800 placeholder:text-slate-400 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="" disabled>
                Pilih Posisi
              </option>
              {positions.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          {editData && (
            <label className="flex items-center gap-2 mt-4 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="text-sm font-semibold text-slate-700">
                Akun Aktif (Dapat Login)
              </span>
            </label>
          )}
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

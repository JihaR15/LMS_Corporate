"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

interface ModuleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  editModule: ModuleData | null;
  positions: PositionData[];
  onSuccess: (data: ModuleData, isEdit: boolean) => void;
}

export default function ModuleFormModal({
  isOpen,
  onClose,
  token,
  editModule,
  positions,
  onSuccess,
}: ModuleFormModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    position_id: "",
    passing_score: 70.0,
  });

  useEffect(() => {
    if (editModule) {
      setFormData({
        title: editModule.title,
        description: editModule.description || "",
        position_id: editModule.position_id.toString(),
        passing_score: editModule.passing_score,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        position_id: "",
        passing_score: 70.0,
      });
    }
  }, [editModule, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const url = editModule
      ? `${process.env.NEXT_PUBLIC_API_URL}/modules/${editModule.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/modules`;

    const method = editModule ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          position_id: parseInt(formData.position_id),
          passing_score: parseFloat(formData.passing_score.toString()),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        onSuccess(result.data, !!editModule);
        onClose();
        router.refresh();
      } else {
        alert(result.message || "Gagal menyimpan modul");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-100 flex items-center justify-center transition-all duration-300">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform scale-100 translate-y-0 transition-transform duration-300">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">
              menu_book
            </span>
            {editModule ? "Edit Modul Pelatihan" : "Tambah Modul Baru"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
              Judul Modul
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Contoh: Dasar-dasar Mekanik Pabrik"
              className="w-full px-4 py-2.5 border border-slate-300 bg-white text-slate-700 placeholder:text-slate-400 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
              Deskripsi Singkat
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Tuliskan deskripsi singkat mengenai isi modul..."
              className="w-full px-4 py-2.5 border border-slate-300 bg-white text-slate-700 placeholder:text-slate-400 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm transition-all resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                Posisi Jabatan
              </label>
              <div className="relative">
                <select
                  name="position_id"
                  value={formData.position_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 bg-white text-slate-700 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm transition-all appearance-none"
                >
                  <option value="" disabled>
                    Pilih Posisi...
                  </option>
                  {positions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  unfold_more
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                KKM (0-100)
              </label>
              <input
                type="number"
                name="passing_score"
                value={formData.passing_score}
                onChange={handleChange}
                step="0.01"
                className="w-full px-4 py-2.5 border border-slate-300 bg-white text-slate-700 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-sm text-sm disabled:opacity-50"
            >
              {isLoading ? "Menyimpan..." : "Simpan Modul"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  deleteId: number | null;
  onSuccess: (id: number) => void;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  token,
  deleteId,
  onSuccess,
}: DeleteConfirmModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteExecute = async () => {
    if (!deleteId) return;
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/modules/${deleteId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const result = await response.json();

      if (response.ok) {
        onSuccess(deleteId);
        onClose();
        router.refresh();
      } else {
        alert(result.message);
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
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform scale-100 translate-y-0 transition-transform duration-300">
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 border border-red-100">
            <span className="material-symbols-outlined text-red-600 text-[32px]">
              warning
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Hapus Modul?</h2>
          <p className="text-sm text-slate-500 mb-6">
            Apakah Anda yakin ingin menghapus modul ini? Tindakan ini tidak
            dapat dibatalkan dan semua data terkait akan hilang.
          </p>
          <div className="flex w-full gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all text-sm"
            >
              Batal
            </button>
            <button
              onClick={handleDeleteExecute}
              disabled={isLoading}
              className="flex-1 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all shadow-md text-sm disabled:opacity-50"
            >
              {isLoading ? "Menghapus..." : "Ya, Hapus"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
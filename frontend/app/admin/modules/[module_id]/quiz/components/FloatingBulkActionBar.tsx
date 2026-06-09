"use client";
import React from "react";

interface FloatingBulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDeleteBulk: () => void;
}

export default function FloatingBulkActionBar({ 
  selectedCount, 
  totalCount, 
  onSelectAll, 
  onClearSelection, 
  onDeleteBulk 
}: FloatingBulkActionBarProps) {
  
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300 w-max max-w-[95vw] overflow-x-auto no-scrollbar">
      {/* Container Melayang: Shadow menyebar rata (0_0_50px) agar sangat terpisah dari background */}
      <div className="bg-white text-slate-800 px-8 py-4 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.2)] flex flex-nowrap items-center gap-8 border border-slate-200">
        
        {/* Bagian Informasi Jumlah Soal */}
        <div className="flex items-center gap-4 shrink-0 whitespace-nowrap">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-sm border border-emerald-200">
            {selectedCount}
          </div>
          <span className="text-sm font-bold text-slate-700">Soal Terpilih</span>
        </div>

        {/* Garis Pemisah (Divider) */}
        <div className="w-px h-10 bg-slate-200 shrink-0"></div>

        {/* Bagian Tombol Aksi (Tidak akan turun ke bawah) */}
        <div className="flex items-center gap-3 shrink-0 whitespace-nowrap">
          <button 
            onClick={onSelectAll}
            className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 hover:text-emerald-700 rounded-xl transition-all"
          >
            {selectedCount === totalCount ? "Batal Pilih Semua" : "Pilih Semua"}
          </button>
          
          <button 
            onClick={onClearSelection}
            className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-red-300 hover:text-red-600 rounded-xl transition-all"
          >
            Bersihkan Pilihan
          </button>
        </div>

        {/* Tombol Hapus Utama */}
        <button 
          onClick={onDeleteBulk}
          className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 shrink-0 whitespace-nowrap ml-2"
        >
          <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
          Hapus
        </button>
      </div>
    </div>
  );
}
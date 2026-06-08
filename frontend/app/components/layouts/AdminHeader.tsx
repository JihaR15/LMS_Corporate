"use client";

export default function AdminHeader() {
  return (
    <header className="fixed top-0 right-0 w-[calc(100%-280px)] h-16 bg-white border-b border-slate-200 flex justify-between items-center px-8 z-40 shadow-sm">
      
      {/* Search Bar */}
      <div className="flex items-center bg-slate-100 rounded-full px-4 py-2 w-96 border border-transparent focus-within:border-emerald-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
        <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
        <input 
          type="text" 
          placeholder="Cari modul atau karyawan..." 
          className="bg-transparent border-none focus:outline-none text-sm w-full ml-2 text-slate-700 placeholder:text-slate-400"
        />
      </div>

      {/* Profile Section */}
      <div className="flex items-center gap-4">
        <button className="text-slate-500 hover:bg-slate-100 p-2 rounded-full transition-colors">
          <span className="material-symbols-outlined text-[22px]">notifications</span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200 ml-2">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-slate-800 leading-tight">Admin Utama</p>
            <p className="text-xs text-slate-500">Super Admin</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200 text-emerald-700 font-bold text-sm">
            AU
          </div>
        </div>
      </div>
    </header>
  );
}
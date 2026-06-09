"use client";

interface AdminHeaderProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  user: { fullname: string; role: string } | null;
}

export default function AdminHeader({ isOpen, toggleSidebar, user }: AdminHeaderProps) {
  const initials = user?.fullname
    ? user.fullname.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : "AD";

  return (
    <header 
      className={`fixed top-0 right-0 h-16 bg-white border-b border-slate-200 flex justify-between items-center px-4 md:px-8 z-40 shadow-sm transition-all duration-300 ease-in-out ${
        isOpen ? "w-full md:w-[calc(100%-280px)]" : "w-full"
      }`}
    >
      <button 
        onClick={toggleSidebar}
        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center"
      >
        <span className="material-symbols-outlined text-[24px]">menu</span>
      </button>

      <div className="flex items-center gap-3 pl-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-800 leading-tight">
            {user?.fullname || "Memuat..."}
          </p>
          <p className="text-xs text-slate-500 capitalize">
            {user?.role || "Admin"}
          </p>
        </div>
        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200 text-emerald-700 font-bold text-sm">
          {initials}
        </div>
      </div>
    </header>
  );
}
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

export default function OperatorHeader({ user }: { user: any }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const result = await logoutAction();
    if (result.success) {
      router.push("/login");
      router.refresh();
    }
  };

  const initials = user?.fullname
    ? user.fullname.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : "OP";

  return (
    <header className="sticky top-0 z-50 flex justify-between items-center w-full px-8 h-16 bg-white shadow-sm border-b border-slate-200">
      <div className="flex items-center gap-3">
        <div className="bg-primary p-2 rounded-full flex items-center justify-center text-white">
          <span className="material-symbols-outlined text-[20px]">book_4</span>
        </div>
        <span className="text-xl font-bold text-primary tracking-tight">LMS Greenfields</span>
      </div>

      <div className="flex items-center gap-6">
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="/operator/dashboard" 
            className={`py-5 font-semibold text-sm border-b-2 transition-all ${
              pathname === "/operator/dashboard" ? "border-primary text-primary" : "border-transparent text-slate-600 hover:text-primary"
            }`}
          >
            Dashboard
          </Link>
          <a href="#" className="text-slate-500 hover:text-primary transition-colors py-5 text-sm font-medium">Materi Saya</a>
        </nav>
        
        <div className="h-8 w-px bg-slate-200 mx-2"></div>
        
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="relative w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-xs border border-emerald-200">
            {initials}
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="flex flex-col sm:flex">
            <span className="text-xs font-bold text-slate-800">{user?.fullname || "Operator"}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{user?.role || "Karyawan"}</span>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="text-xs font-bold">Logout</span>
        </button>
      </div>
    </header>
  );
}
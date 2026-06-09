"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { useEffect } from "react";

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export default function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: "Dashboard", icon: "dashboard", path: "/admin/dashboard" },
    { name: "Manajemen Posisi", icon: "work_outline", path: "/admin/positions"},
    { name: "Manajemen User", icon: "group", path: "/admin/users" },
    { name: "Modul & Materi", icon: "menu_book", path: "/admin/modules" },
  ];

  const handleLogout = async () => {
    const result = await logoutAction();
    if (result.success) {
      router.push("/login");
      router.refresh();
    }
  };

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  }, [pathname, setIsOpen]);

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside 
        className={`fixed h-full w-70 left-0 top-0 bg-white flex flex-col justify-between py-6 border-r border-slate-200 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-8">
          {/* Brand Logo & Close Button */}
          <div className="flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
                style={{ backgroundColor: "var(--primary)" }}
              >
                <span className="material-symbols-outlined text-white">book_4</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-slate-800">
                  LMS Greenfields
                </span>
                <span className="text-xs font-medium text-slate-500">
                  Corporate Learning
                </span>
              </div>
            </div>
            
            {/* Tombol Tutup Silang di Mobile */}
            <button 
              onClick={() => setIsOpen(false)}
              className="md:hidden text-slate-500 hover:bg-slate-100 p-1 rounded-md"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 px-3">
            {menuItems.map((item) => {
              const isActive = pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  style={
                    isActive
                      ? {
                          color: "var(--primary)",
                          backgroundColor: "var(--primary-light)",
                        }
                      : {}
                  }
                >
                  <span className="material-symbols-outlined text-[22px]">
                    {item.icon}
                  </span>
                  <span className="text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Logout */}
        <div className="px-6 border-t border-slate-200 pt-6">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <span className="material-symbols-outlined text-[22px]">logout</span>
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
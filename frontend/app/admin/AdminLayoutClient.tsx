"use client";
import { useState } from "react";
import AdminSidebar from "../components/layouts/AdminSidebar";
import AdminHeader from "../components/layouts/AdminHeader";

export default function AdminLayoutClient({ 
  children, 
  user 
}: { 
  children: React.ReactNode;
  user: any;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <AdminHeader 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        user={user} 
      />
      
      <main 
        className={`pt-16 min-h-screen transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "md:ml-70" : "ml-0"
        }`}
      >
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
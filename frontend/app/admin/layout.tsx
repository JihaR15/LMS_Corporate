import AdminSidebar from "../components/layouts/AdminSidebar";
import AdminHeader from "../components/layouts/AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      <AdminHeader />
      
      {/* Area Konten Utama: Memberikan margin kiri selebar sidebar dan margin atas selebar header */}
      <main className="ml-70 pt-16 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
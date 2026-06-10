import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TestClient from "./TestClient";

// Fungsi mengambil data modul (untuk menampilkan judul)
async function getModuleData(moduleId: string, token: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/modules`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const result = await res.json();
    return result.data?.find((m: any) => m.id.toString() === moduleId) || null;
  } catch (error) {
    return null;
  }
}

// Fungsi mengambil data soal
async function getTestQuestions(moduleId: string, token: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/module/${moduleId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const result = await res.json();
    
    if (!result.data) return [];

    // KEAMANAN TINGKAT TINGGI: 
    // Hapus data 'is_correct' di sisi Server sebelum dikirim ke Client (Browser)
    // agar operator tidak bisa curang dengan melihat Inspect Element / Network Tab.
    const secureQuestions = result.data.map((q: any) => ({
      ...q,
      answers: q.answers.map((a: any) => {
        const { is_correct, ...safeAnswer } = a; // Pisahkan is_correct, ambil sisanya
        return safeAnswer;
      })
    }));

    return secureQuestions;
  } catch (error) {
    return [];
  }
}

export default async function OperatorTestPage({ params }: { params: { module_id: string } }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  // Next.js 15+ memerlukan params untuk di-await
  const { module_id } = await params;

  // Fetch data modul dan data soal secara paralel agar lebih cepat
  const [moduleData, questions] = await Promise.all([
    getModuleData(module_id, token),
    getTestQuestions(module_id, token)
  ]);

  if (!moduleData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Modul Tidak Ditemukan</h2>
          <p className="text-slate-500">Modul yang Anda cari tidak ada atau telah dihapus.</p>
        </div>
      </div>
    );
  }

  return <TestClient moduleData={moduleData} questions={questions} token={token} />;
}
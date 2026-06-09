import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import QuizClient from "./QuizClient";

async function getModuleData(moduleId: string, token: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/modules`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const result = await res.json();
    return result.data.find((m: any) => m.id.toString() === moduleId) || null;
  } catch (error) {
    return null;
  }
}

export default async function QuizModulePage({ params }: { params: { module_id: string } }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) redirect("/login");

  const { module_id } = await params;
  const moduleData = await getModuleData(module_id, token);

  if (!moduleData) {
    return (
      <div className="p-8 text-center text-slate-500">
        Modul tidak ditemukan.
      </div>
    );
  }

  return <QuizClient moduleData={moduleData} token={token} />;
}
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LearnClient from "./LearnClient";

function decodeJWT(token: string) {
  try {
    const base64Payload = token.split(".")[1];
    const payloadBuffer = Buffer.from(base64Payload, "base64");
    return JSON.parse(payloadBuffer.toString("utf8"));
  } catch (error) {
    return null;
  }
}

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

async function getMaterials(moduleId: string, token: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/materials/module/${moduleId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );
    const result = await res.json();
    return result.data || [];
  } catch (error) {
    return [];
  }
}

async function getUserProgress(moduleId: string, token: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/progress/module/${moduleId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );
    const result = await res.json();
    return result.data?.completed_material_ids || [];
  } catch (error) {
    return [];
  }
}

export default async function LearnPage({
  params,
}: {
  params: { module_id: string };
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const currentUser = decodeJWT(token);

  const { module_id } = await params;

  const [moduleData, materials, progress] = await Promise.all([
    getModuleData(module_id, token),
    getMaterials(module_id, token),
    getUserProgress(module_id, token),
  ]);

  if (!moduleData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 font-semibold">Modul tidak ditemukan.</p>
      </div>
    );
  }

  // 2. CEK OTORISASI KEAMANAN (GATEKEEPER)
  if (
    moduleData.position_id !== null &&
    moduleData.position_id !== currentUser?.position_id &&
    currentUser?.role !== "admin"
  ) {
    return (
      <div className="min-h-screen flex flex-col gap-4 items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl text-red-600">
            gpp_bad
          </span>
        </div>
        <h2 className="text-xl font-bold text-slate-800">Akses Ditolak</h2>
        <p className="text-slate-500">
          Anda tidak memiliki izin untuk mengakses modul pelatihan dari posisi
          jabatan ini.
        </p>
        <a
          href="/operator/dashboard"
          className="mt-4 px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all"
        >
          Kembali ke Dashboard
        </a>
      </div>
    );
  }

  return (
    <LearnClient
      moduleData={moduleData}
      materials={materials}
      completedMaterialIds={progress}
      token={token}
    />
  );
}

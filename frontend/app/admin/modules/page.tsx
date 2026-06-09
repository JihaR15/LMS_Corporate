import { cookies } from "next/headers";
import ModuleClient from "./ModuleClient";

async function getModules(token: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/modules`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Gagal load modules:", error);
    return [];
  }
}

async function getPositions(token: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/positions`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Gagal load positions:", error);
    return [];
  }
}

export default async function ModulesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  const [modules, positions] = await Promise.all([
    getModules(token),
    getPositions(token),
  ]);

  return <ModuleClient initialModules={modules} initialPositions={positions} token={token} />;
}
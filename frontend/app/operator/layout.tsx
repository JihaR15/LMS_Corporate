import { cookies } from "next/headers";
import OperatorHeader from "../components/layouts/OperatorHeader";
import OperatorFooter from "../components/layouts/OperatorFooter";

async function getUserProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    const result = await response.json();
    return result.data;
  } catch (error) {
    return null;
  }
}

export default async function OperatorLayout({ children }: { children: React.ReactNode }) {
  const user = await getUserProfile();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        {/* Alirkan data user ke Header */}
        <OperatorHeader user={user} />
        <main>{children}</main>
      </div>
      <OperatorFooter />
    </div>
  );
}
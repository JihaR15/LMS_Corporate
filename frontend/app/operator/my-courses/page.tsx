import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import MyCoursesClient from "./MyCoursesClient";

async function getOperatorDashboardData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  
  if (!token) {
    redirect("/login");
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/operator/dashboard-data`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );
    const result = await response.json();
    return result.data || { modules: [], stats: { total_passed_tests: 0 } };
  } catch (error) {
    return { modules: [], stats: { total_passed_tests: 0 } };
  }
}

export default async function MyCoursesPage() {
  const dashboardData = await getOperatorDashboardData();
  const { modules, stats } = dashboardData;

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-slate-50">
      <MyCoursesClient modules={modules} stats={stats} />
    </div>
  );
}
import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PositionsClient from "./PositionsClient";

async function getUserSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return { token, role: 'admin' }; 
}

async function getPositions(token: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/positions`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    if (!res.ok) return [];
    const result = await res.json();
    return result.data || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function AdminPositionsPage() {
  const session = await getUserSession();
  
  if (!session || session.role !== 'admin') {
    redirect("/login");
  }

  const initialPositions = await getPositions(session.token);

  return <PositionsClient initialPositions={initialPositions} token={session.token} />;
}
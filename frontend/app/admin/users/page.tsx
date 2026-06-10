import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import UsersClient from "./UsersClient";

async function getUserSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return { token, role: 'admin' };
}

async function getOperators(token: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/operators`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    if (!res.ok) return [];
    const result = await res.json();
    return result.data || [];
  } catch (error) {
    return [];
  }
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
    return [];
  }
}

export default async function AdminUsersPage() {
  const session = await getUserSession();
  if (!session || session.role !== 'admin') redirect("/login");

  const [initialUsers, positions] = await Promise.all([
    getOperators(session.token),
    getPositions(session.token)
  ]);

  return <UsersClient initialUsers={initialUsers} positions={positions} token={session.token} />;
}
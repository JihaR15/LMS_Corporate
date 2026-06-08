"use server";

import { cookies } from "next/headers";

export async function loginAction(nik: string, pass: string) {
  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nik, password: pass }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || "Gagal menghubungi server" };
    }

    const cookieStore = await cookies();

    cookieStore.set({
      name: "token",
      value: data.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
    });

    cookieStore.set({
      name: "userRole",
      value: data.user.role,
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return { success: true, role: data.user.role };
  } catch (error: any) {
    return { success: false, message: error.message || "Terjadi kesalahan jaringan" };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();

  cookieStore.delete("token");
  cookieStore.delete("userRole");
  
  return { success: true };
}
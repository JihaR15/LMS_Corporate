"use client";
import React, { useState, useEffect } from "react";
import { UserData } from "./UsersClient";

interface RaporItem {
  module_id: number;
  module_name: string;
  progress_percentage: number;
  post_test_score: number | null;
  status: string;
}

export default function RaporModal({
  isOpen,
  onClose,
  token,
  user,
}: {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  user: UserData;
}) {
  const [raporData, setRaporData] = useState<RaporItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      setIsLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}/rapor`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setRaporData(data.data || []);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, [isOpen, user, token]);

  if (!isOpen) return null;

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

  const getStatusColor = (status: string) => {
    if (status === "Lulus") return "bg-green-100 text-green-700";
    if (status === "Tidak Lulus") return "bg-red-100 text-red-700";
    if (status === "Sedang Berjalan") return "bg-yellow-100 text-yellow-700";
    return "bg-slate-100 text-slate-600";
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Rapor Header */}
        <div className="bg-emerald-600/5 px-6 py-8 relative shrink-0">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-emerald-600/20">
                {getInitials(user.fullname)}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  {user.fullname}
                </h3>
                <p className="text-sm font-medium text-slate-600 mt-1">
                  NIK: {user.nik} • {user.position_name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-500 hover:bg-slate-200 rounded-full p-2"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <span className="material-symbols-outlined absolute -right-5 -bottom-5 text-[120px] text-emerald-600/5 -rotate-12 pointer-events-none">
            history_edu
          </span>
        </div>

        {/* Rapor Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">
              school
            </span>
            Transkrip Modul Pelatihan
          </h4>

          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Modul
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Progres Materi
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Skor Ujian
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Status Akhir
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      Memuat data rapor...
                    </td>
                  </tr>
                ) : raporData.length > 0 ? (
                  raporData.map((item) => (
                    <tr key={item.module_id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {item.module_name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-emerald-600 w-8">
                            {item.progress_percentage}%
                          </span>
                          <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 transition-all"
                              style={{ width: `${item.progress_percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700">
                        {item.post_test_score !== null
                          ? item.post_test_score
                          : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider whitespace-nowrap inline-block ${getStatusColor(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      Belum ada modul yang terdaftar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

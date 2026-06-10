"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import QuestionCard from "./components/QuestionCard";
import FloatingBulkActionBar from "./components/FloatingBulkActionBar";

interface ModuleData {
  id: number;
  title: string;
}

interface AnswerData {
  id?: number;
  answer_text: string;
  is_correct: boolean;
}

interface QuestionData {
  id: number;
  module_id: number;
  question_text: string;
  sequence_order: number;
  answers: AnswerData[];
}

export default function QuizClient({
  moduleData,
  token,
}: {
  moduleData: ModuleData;
  token: string;
}) {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State Modal (Tambah & Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentEditId, setCurrentEditId] = useState<number | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [answerOptions, setAnswerOptions] = useState(["", "", "", ""]);
  const [answerIds, setAnswerIds] = useState<(number | undefined)[]>([
    undefined,
    undefined,
    undefined,
    undefined,
  ]);
  const [correctIndex, setCorrectIndex] = useState<number | "">("");

  // State Modal Hapus & Bulk Delete
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Import Excel State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState("");

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/questions/module/${moduleData.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const result = await res.json();
      if (res.ok) {
        setQuestions(result.data || []);
        setSelectedIds([]); // Reset pilihan saat memuat ulang data
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIKA CHECKBOX ---
  const handleSelectAll = () => {
    if (selectedIds.length === questions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(questions.map((q) => q.id));
    }
  };

  const handleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // --- LOGIKA HAPUS (SINGLE & BULK) ---
  const executeDelete = async (url: string, method: string, body?: any) => {
    setIsDeleting(true);
    try {
      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      if (body) options.body = JSON.stringify(body);

      const res = await fetch(url, options);
      if (res.ok) {
        fetchQuestions();
        setDeleteId(null);
        setIsBulkDeleteModalOpen(false);
        setSelectedIds([]);
      } else {
        const err = await res.json();
        alert(err.message || "Gagal menghapus soal");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem saat menghapus.");
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmSingleDelete = () => {
    if (!deleteId) return;
    executeDelete(
      `${process.env.NEXT_PUBLIC_API_URL}/questions/${deleteId}`,
      "DELETE",
    );
  };

  const confirmBulkDelete = () => {
    if (selectedIds.length === 0) return;
    executeDelete(
      `${process.env.NEXT_PUBLIC_API_URL}/questions/bulk-delete`,
      "POST",
      { ids: selectedIds },
    );
  };

  // --- LOGIKA BUKA MODAL TAMBAH ---
  const handleOpenAddModal = () => {
    setModalMode("add");
    setCurrentEditId(null);
    setQuestionText("");
    setAnswerOptions(["", "", "", ""]);
    setAnswerIds([undefined, undefined, undefined, undefined]);
    setCorrectIndex("");
    setIsModalOpen(true);
  };

  // --- LOGIKA BUKA MODAL EDIT ---
  const handleEditClick = (q: QuestionData) => {
    setModalMode("edit");
    setCurrentEditId(q.id);
    setQuestionText(q.question_text);

    // Mapping data jawaban dari database ke dalam form
    const options = ["", "", "", ""];
    const ids: (number | undefined)[] = [
      undefined,
      undefined,
      undefined,
      undefined,
    ];
    let correctIdx: number | "" = "";

    q.answers.forEach((ans, idx) => {
      if (idx < 4) {
        options[idx] = ans.answer_text;
        ids[idx] = ans.id;
        if (ans.is_correct) correctIdx = idx;
      }
    });

    setAnswerOptions(options);
    setAnswerIds(ids);
    setCorrectIndex(correctIdx);
    setIsModalOpen(true);
  };

  // --- LOGIKA SIMPAN (TAMBAH / EDIT) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !questionText ||
      correctIndex === "" ||
      answerOptions.some((ans) => ans.trim() === "")
    ) {
      alert("Harap isi semua kolom pertanyaan dan jawaban.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      module_id: moduleData.id,
      question_text: questionText,
      sequence_order: modalMode === "add" ? questions.length + 1 : undefined,
      answers: answerOptions.map((text, idx) => ({
        id: modalMode === "edit" ? answerIds[idx] : undefined,
        answer_text: text,
        is_correct: idx === correctIndex,
      })),
    };

    const url =
      modalMode === "add"
        ? `${process.env.NEXT_PUBLIC_API_URL}/questions`
        : `${process.env.NEXT_PUBLIC_API_URL}/questions/${currentEditId}`;

    const method = modalMode === "add" ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchQuestions();
        setIsModalOpen(false);
      } else {
        const err = await res.json();
        alert(err.message || "Gagal menyimpan soal");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem saat menyimpan soal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...answerOptions];
    newOptions[index] = value;
    setAnswerOptions(newOptions);
  };

  // --- LOGIKA IMPORT EXCEL ---
  const handleDownloadTemplate = () =>
    window.open("/template-soal.xlsx", "_blank");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImportModalOpen(false);
    setIsImporting(true);

    const formData = new FormData();
    formData.append("module_id", moduleData.id.toString());
    formData.append("excel_file", file);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/questions/import`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );

      const result = await res.json();
      if (res.ok) {
        setImportSuccessMessage(
          result.message || "Berhasil mengimpor soal dari Excel!",
        );
        fetchQuestions();
      } else {
        alert(result.message || "Gagal mengimpor file Excel.");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan jaringan saat mengimpor.");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-32">
      {/* Header & Back Button */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="space-y-4">
          <button
            onClick={() => router.push("/admin/modules")}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-emerald-700 rounded-lg text-sm font-semibold transition-all w-fit"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>
            Kembali ke Daftar Modul
          </button>

          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Manajemen Soal Kuis
            </h2>
            <p className="text-sm text-slate-500 max-w-2xl mt-1">
              Modul:{" "}
              <strong className="text-slate-700">{moduleData.title}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-emerald-50 px-4 py-2 rounded-xl flex items-center gap-2 border border-emerald-100">
            <span className="material-symbols-outlined text-emerald-600 text-sm">
              quiz
            </span>
            <span className="text-xs font-bold text-emerald-800">
              Total: {questions.length} Soal
            </span>
          </div>

          <input
            type="file"
            accept=".xlsx, .xls"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={() => setIsImportModalOpen(true)}
            disabled={isImporting}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isImporting ? "hourglass_empty" : "upload_file"}
            </span>
            {isImporting ? "Mengimpor..." : "Import Excel"}
          </button>

          <button
            onClick={handleOpenAddModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tambah Soal
          </button>
        </div>
      </div>

      {/* RENDER QUESTION LIST MODULAR */}
      <div className="flex flex-col gap-5 mt-5">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
            <p className="text-xs font-medium text-slate-500">
              Memuat bank soal...
            </p>
          </div>
        ) : questions.length > 0 ? (
          questions.map((q, index) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={index}
              isSelected={selectedIds.includes(q.id)}
              onToggleSelect={handleSelectOne}
              onDeleteClick={(id) => setDeleteId(id)}
              onEditClick={handleEditClick}
            />
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-slate-400">
                quiz
              </span>
            </div>
            <h4 className="text-slate-700 font-bold mb-1">Belum Ada Soal</h4>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Anda belum menambahkan soal evaluasi untuk modul ini. Klik tombol{" "}
              <strong>Tambah Soal</strong> atau{" "}
              <strong>Import dari Excel</strong> untuk memulai.
            </p>
          </div>
        )}
      </div>

      {/* RENDER FLOATING ACTION BAR */}
      <FloatingBulkActionBar
        selectedCount={selectedIds.length}
        totalCount={questions.length}
        onSelectAll={handleSelectAll}
        onClearSelection={() => setSelectedIds([])}
        onDeleteBulk={() => setIsBulkDeleteModalOpen(true)}
      />

      {/* --- MODAL PANDUAN IMPORT EXCEL --- */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all">
          <div className="bg-white dark:bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 dark:bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-800">
                    Panduan Import Excel
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    Unggah bank soal sekaligus menggunakan file Excel (.xlsx)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <p className="text-sm text-slate-600 dark:text-slate-600 mb-4 leading-relaxed">
                Untuk mencegah error sistem, pastikan file Excel yang akan Anda
                unggah memiliki <strong>Header Baris Pertama</strong> yang
                persis (peka huruf besar/kecil) seperti format di bawah ini:
              </p>

              <div className="overflow-x-auto border border-slate-200 rounded-xl mb-6">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-100 dark:bg-slate-100 text-slate-700 dark:text-slate-700">
                    <tr>
                      <th className="px-4 py-3 font-bold border-b border-slate-200">
                        Pertanyaan
                      </th>
                      <th className="px-4 py-3 font-bold border-b border-slate-200">
                        Opsi A
                      </th>
                      <th className="px-4 py-3 font-bold border-b border-slate-200">
                        Opsi B
                      </th>
                      <th className="px-4 py-3 font-bold border-b border-slate-200">
                        Opsi C
                      </th>
                      <th className="px-4 py-3 font-bold border-b border-slate-200">
                        Opsi D
                      </th>
                      <th className="px-4 py-3 font-bold border-b border-slate-200">
                        Jawaban Benar
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-600">
                        Suhu pasteurisasi...
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-600">
                        72° C
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-600">
                        60° C
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-600">
                        80° C
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-600">
                        100° C
                      </td>
                      <td className="px-4 py-3 text-emerald-600 font-bold bg-emerald-50 text-center">
                        A
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 text-amber-800 text-xs leading-relaxed">
                <span className="material-symbols-outlined text-[18px] shrink-0">
                  info
                </span>
                <p>
                  Kolom <strong>"Jawaban Benar"</strong> hanya boleh diisi
                  dengan 1 huruf kapital saja: <strong>A, B, C, atau D</strong>.
                  Jangan mencampur dengan teks lain. Anda dapat mengunduh format
                  kosong di bawah ini agar lebih aman.
                </p>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
              <button
                onClick={handleDownloadTemplate}
                className="px-4 py-2 border border-slate-300 bg-white text-slate-700 dark:text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">
                  download
                </span>
                Unduh Template Kosong
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-5 py-2 text-slate-600 dark:text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-sm active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    upload_file
                  </span>
                  Pilih File & Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL FORM SOAL (Bisa mode Tambah atau Edit) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm transition-all">
          <div className="bg-white dark:bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div
              className={`${modalMode === "add" ? "bg-emerald-600" : "bg-blue-600"} p-6 sm:p-8 text-white flex justify-between items-center shrink-0 transition-colors`}
            >
              <div>
                <h2 className="text-xl font-bold">
                  {modalMode === "add" ? "Tambah Soal Baru" : "Edit Soal"}
                </h2>
                <p className="opacity-80 text-sm mt-1">
                  {modalMode === "add"
                    ? "Isi pertanyaan dan kunci jawaban dengan benar."
                    : "Perbarui teks pertanyaan atau opsi jawaban."}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all shrink-0"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-600 mb-2 uppercase tracking-wide">
                    Teks Pertanyaan
                  </label>
                  <textarea
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    required
                    className={`w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm outline-none transition-all text-slate-800 dark:text-slate-800 min-h-[100px] ${
                      modalMode === "add"
                        ? "focus:ring-emerald-500 focus:border-emerald-500"
                        : "focus:ring-blue-500 focus:border-blue-500"
                    }`}
                    placeholder="Tuliskan pertanyaan evaluasi di sini..."
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {["A", "B", "C", "D"].map((letter, idx) => (
                    <div key={`input-${letter}`}>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-600 mb-2 uppercase tracking-wide">
                        Pilihan {letter}
                      </label>
                      <div
                        className={`flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-1.5 transition-all focus-within:ring-1 ${
                          modalMode === "add"
                            ? "focus-within:border-emerald-500 focus-within:ring-emerald-500"
                            : "focus-within:border-blue-500 focus-within:ring-blue-500"
                        }`}
                      >
                        <span className="w-8 h-8 flex items-center justify-center bg-slate-200 text-slate-700 dark:text-slate-700 text-xs font-bold rounded-lg shrink-0">
                          {letter}
                        </span>
                        <input
                          type="text"
                          required
                          value={answerOptions[idx]}
                          onChange={(e) =>
                            handleOptionChange(idx, e.target.value)
                          }
                          className="bg-transparent border-none w-full outline-none text-sm px-2 text-slate-800 dark:text-slate-800 placeholder:text-slate-400"
                          placeholder={`Teks jawaban ${letter}...`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-600 mb-2 uppercase tracking-wide">
                    Pilih Kunci Jawaban Benar
                  </label>
                  <div className="relative">
                    <select
                      value={correctIndex}
                      onChange={(e) => setCorrectIndex(Number(e.target.value))}
                      required
                      className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-10 appearance-none text-sm font-bold text-slate-700 dark:text-slate-700 outline-none transition-all cursor-pointer ${
                        modalMode === "add"
                          ? "focus:ring-emerald-500 focus:border-emerald-500"
                          : "focus:ring-blue-500 focus:border-blue-500"
                      }`}
                    >
                      <option value="" disabled>
                        Pilih salah satu (A, B, C, atau D)
                      </option>
                      <option value={0}>Pilihan A</option>
                      <option value={1}>Pilihan B</option>
                      <option value={2}>Pilihan C</option>
                      <option value={3}>Pilihan D</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      expand_more
                    </span>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-50 border-t border-slate-200 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 dark:text-slate-600 bg-white dark:bg-white border border-slate-300 hover:bg-slate-50 transition-all text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`${modalMode === "add" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"} disabled:opacity-50 text-white px-8 py-2.5 rounded-xl font-semibold shadow-sm transition-all active:scale-95 text-sm`}
              >
                {isSubmitting
                  ? "Menyimpan..."
                  : modalMode === "add"
                    ? "Simpan Soal"
                    : "Update Soal"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL KONFIRMASI HAPUS SINGLE --- */}
      {deleteId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all">
          <div className="bg-white dark:bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden transform scale-100 transition-transform">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-100">
                <span className="material-symbols-outlined text-red-500 text-[32px]">
                  warning
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-800 mb-2">
                Hapus Soal?
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
                Soal ini beserta seluruh pilihan jawabannya akan dihapus secara
                permanen. Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDeleteId(null)}
                  disabled={isDeleting}
                  className="px-6 py-2.5 bg-slate-100 dark:bg-slate-100 text-slate-700 dark:text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all text-sm"
                >
                  Batal
                </button>
                <button
                  onClick={confirmSingleDelete}
                  disabled={isDeleting}
                  className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all shadow-sm active:scale-95 text-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? "Menghapus..." : "Ya, Hapus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL KONFIRMASI HAPUS BULK --- */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all">
          <div className="bg-white dark:bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden transform scale-100 transition-transform">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-100">
                <span className="material-symbols-outlined text-red-500 text-[32px]">
                  delete_sweep
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-800 mb-2">
                Hapus {selectedIds.length} Soal Sekaligus?
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
                Seluruh soal yang dipilih beserta jawabannya akan dihapus secara
                permanen. Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setIsBulkDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="px-6 py-2.5 bg-slate-100 dark:bg-slate-100 text-slate-700 dark:text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all text-sm"
                >
                  Batal
                </button>
                <button
                  onClick={confirmBulkDelete}
                  disabled={isDeleting}
                  className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all shadow-sm active:scale-95 text-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? "Menghapus..." : "Ya, Hapus Semua"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL SUKSES IMPORT --- */}
      {importSuccessMessage && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all">
          <div className="bg-white dark:bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden transform scale-100 transition-transform text-center p-6">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-100">
              <span className="material-symbols-outlined text-emerald-500 text-[32px]">
                check_circle
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-800 mb-2">
              Import Berhasil!
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-500 mb-6 leading-relaxed">
              {importSuccessMessage}
            </p>
            <button
              onClick={() => setImportSuccessMessage("")}
              className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-sm active:scale-95 text-sm"
            >
              Tutup & Lihat Soal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UploadMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  moduleId: number | null;
  currentSequence: number;
  onSuccess: (moduleId: number, nextSequence: number) => void;
}

export default function UploadMaterialModal({
  isOpen,
  onClose,
  token,
  moduleId,
  currentSequence,
  onSuccess,
}: UploadMaterialModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: "",
    type: "pdf",
  });

  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setUploadData({ title: "", type: "pdf" });
    }
  }, [isOpen]);

  const handleUploadChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUploadData((prev) => ({ ...prev, [name]: value }));
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !moduleId) {
      alert("Silakan pilih file terlebih dahulu");
      return;
    }

    setIsLoading(true);
    const bodyFormData = new FormData();
    bodyFormData.append("module_id", moduleId.toString());
    bodyFormData.append("title", uploadData.title);
    bodyFormData.append("type", uploadData.type);
    bodyFormData.append("sequence_order", currentSequence.toString());
    bodyFormData.append("file", selectedFile);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/materials`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: bodyFormData,
        }
      );

      const result = await response.json();

      if (response.ok) {
        onSuccess(moduleId, currentSequence);
        onClose();
        router.refresh();
      } else {
        alert(result.message || "Gagal mengunggah materi");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-110 flex items-center justify-center transition-all duration-300`}>
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform scale-100 translate-y-0 transition-transform duration-300">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">
            Unggah Materi Modul
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <p className="text-sm text-slate-500">
            Tambahkan dokumen PDF atau video pelatihan untuk modul ini.
          </p>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
              Nama Materi
            </label>
            <input
              type="text"
              name="title"
              value={uploadData.title}
              onChange={handleUploadChange}
              required
              placeholder="Contoh: Panduan Keselamatan Kerja"
              className="w-full px-4 py-2.5 border border-slate-300 bg-white text-slate-700 placeholder:text-slate-400 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
              Tipe Materi
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="radio"
                  name="type"
                  value="pdf"
                  checked={uploadData.type === "pdf"}
                  onChange={handleUploadChange}
                  className="text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span className="text-sm font-medium">PDF</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="radio"
                  name="type"
                  value="video"
                  checked={uploadData.type === "video"}
                  onChange={handleUploadChange}
                  className="text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span className="text-sm font-medium">Video</span>
              </label>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={uploadData.type === "pdf" ? ".pdf" : ".mp4,.mov"}
            className="hidden"
          />

          <div
            onClick={handleBoxClick}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer ${
              isDragActive
                ? "border-emerald-500 bg-emerald-50/50"
                : "border-slate-300 bg-slate-50 hover:bg-slate-100"
            }`}
          >
            <span
              className={`material-symbols-outlined text-[48px] ${
                isDragActive ? "text-emerald-600" : "text-slate-400"
              }`}
            >
              cloud_upload
            </span>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700">
                {selectedFile ? selectedFile.name : "Klik atau seret file ke sini"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {selectedFile
                  ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                  : `Mendukung ${
                      uploadData.type === "pdf" ? ".pdf" : ".mp4, .mov"
                    }`}
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-sm text-sm disabled:opacity-50"
            >
              {isLoading ? "Mengunggah..." : "Mulai Unggah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
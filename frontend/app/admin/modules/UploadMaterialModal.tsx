"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MaterialData } from "./ViewMaterialsModal";

interface UploadMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  moduleId: number | null;
  currentSequence: number;
  onSuccess: (moduleId: number, nextSequence: number) => void;
  editData?: MaterialData | null; // Prop baru untuk mode Edit
}

export default function UploadMaterialModal({
  isOpen,
  onClose,
  token,
  moduleId,
  currentSequence,
  onSuccess,
  editData
}: UploadMaterialModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  
  // States Form yang diperluas
  const [uploadData, setUploadData] = useState({
    title: "",
    type: "video" as "pdf" | "video",
  });
  const [sourceType, setSourceType] = useState<"file" | "link">("file");
  const [linkUrl, setLinkUrl] = useState("");

  const isEditMode = !!editData;

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        // --- INIT MODE EDIT ---
        setUploadData({ title: editData.title, type: editData.type as "pdf" | "video" });
        setSelectedFile(null);
        
        // Deteksi URL Eksternal (Link)
        if (editData.file_url.startsWith("http")) {
          setSourceType("link");
          setLinkUrl(editData.file_url);
        } else {
          setSourceType("file");
          setLinkUrl("");
        }
      } else {
        // --- INIT MODE TAMBAH ---
        setUploadData({ title: "", type: "video" });
        setSourceType("file");
        setSelectedFile(null);
        setLinkUrl("");
      }
    }
  }, [isOpen, editData]);

  const handleUploadChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUploadData((prev) => ({ ...prev, [name]: value }));
    setSelectedFile(null); // Reset file jika tipe diganti
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // --- LOGIKA DRAG & DROP ---
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

  // --- LOGIKA SUBMIT (TAMBAH & EDIT) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleId) return;

    if (sourceType === "file" && !selectedFile && !isEditMode) {
      alert("Silakan pilih file terlebih dahulu");
      return;
    }

    if (sourceType === "link" && !linkUrl.trim()) {
      alert("Harap masukkan URL tautan materi.");
      return;
    }

    setIsLoading(true);
    const bodyFormData = new FormData();
    bodyFormData.append("module_id", moduleId.toString());
    bodyFormData.append("title", uploadData.title);
    bodyFormData.append("type", uploadData.type);
    bodyFormData.append("source_type", sourceType);

    // Sequence order hanya dikirim saat tambah materi baru
    if (!isEditMode) {
      bodyFormData.append("sequence_order", currentSequence.toString());
    }

    if (sourceType === "file" && selectedFile) {
      bodyFormData.append("file", selectedFile);
    } else if (sourceType === "link") {
      bodyFormData.append("file_url", linkUrl);
    }

    const endpoint = isEditMode 
      ? `${process.env.NEXT_PUBLIC_API_URL}/materials/${editData.id}` 
      : `${process.env.NEXT_PUBLIC_API_URL}/materials`;
      
    const method = isEditMode ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: bodyFormData,
      });

      const result = await response.json();

      if (response.ok) {
        onSuccess(moduleId, currentSequence);
        onClose();
        router.refresh();
      } else {
        alert(result.message || `Gagal ${isEditMode ? 'memperbarui' : 'mengunggah'} materi`);
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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4 transition-all duration-300">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform scale-100 translate-y-0 flex flex-col max-h-[90vh]">
        
        {/* Header Dinamis (Warna Hijau/Biru) */}
        <div className={`px-6 py-5 border-b border-slate-200 flex justify-between items-center shrink-0 ${isEditMode ? 'bg-blue-600' : 'bg-emerald-600'}`}>
          <div>
            <h2 className="text-lg font-bold text-white">
              {isEditMode ? "Edit Materi Modul" : "Unggah Materi Modul"}
            </h2>
            <p className="text-xs text-white/80 mt-0.5">
              {isEditMode ? "Perbarui judul, tipe, atau ganti file/link." : "Tambahkan PDF, Video, atau Link URL."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 transition-colors p-1 rounded-md"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
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
                className={`w-full px-4 py-2.5 border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 rounded-xl focus:ring-1 outline-none text-sm font-semibold transition-all ${isEditMode ? 'focus:border-blue-500 focus:ring-blue-500' : 'focus:border-emerald-500 focus:ring-emerald-500'}`}
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                Tipe Materi
              </label>
              <div className="flex gap-4">
                <label className={`flex-1 flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                  uploadData.type === "video" ? (isEditMode ? "border-blue-500 bg-blue-50" : "border-emerald-500 bg-emerald-50") : "border-slate-200 hover:bg-slate-50"
                }`}>
                  <input
                    type="radio"
                    name="type"
                    value="video"
                    checked={uploadData.type === "video"}
                    onChange={handleUploadChange}
                    className="hidden"
                  />
                  <span className={`material-symbols-outlined ${uploadData.type === 'video' ? (isEditMode ? 'text-blue-600' : 'text-emerald-600') : 'text-slate-400'}`}>smart_display</span>
                  <span className="text-sm font-bold text-slate-700">Video</span>
                </label>
                
                <label className={`flex-1 flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                  uploadData.type === "pdf" ? (isEditMode ? "border-blue-500 bg-blue-50" : "border-emerald-500 bg-emerald-50") : "border-slate-200 hover:bg-slate-50"
                }`}>
                  <input
                    type="radio"
                    name="type"
                    value="pdf"
                    checked={uploadData.type === "pdf"}
                    onChange={handleUploadChange}
                    className="hidden"
                  />
                  <span className={`material-symbols-outlined ${uploadData.type === 'pdf' ? (isEditMode ? 'text-blue-600' : 'text-emerald-600') : 'text-slate-400'}`}>picture_as_pdf</span>
                  <span className="text-sm font-bold text-slate-700">PDF File</span>
                </label>
              </div>
            </div>

            <div className="h-px bg-slate-200 w-full my-4"></div>

            {/* Sumber File/Link */}
            <div>
              <div className="flex justify-between items-end mb-3">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Sumber File / Tautan
                </label>
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button type="button" onClick={() => setSourceType("file")} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${sourceType === 'file' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    Upload Lokal
                  </button>
                  <button type="button" onClick={() => setSourceType("link")} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${sourceType === 'link' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    Link URL
                  </button>
                </div>
              </div>

              {sourceType === "file" ? (
                <>
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
                        ? (isEditMode ? "border-blue-500 bg-blue-50" : "border-emerald-500 bg-emerald-50")
                        : "border-slate-300 bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[48px] ${
                        selectedFile ? (isEditMode ? "text-blue-600" : "text-emerald-600") : "text-slate-400"
                      }`}
                    >
                      {selectedFile ? "check_circle" : "cloud_upload"}
                    </span>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-700">
                        {selectedFile ? selectedFile.name : "Klik atau seret file ke sini"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {selectedFile
                          ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                          : `Mendukung ${uploadData.type === "pdf" ? ".pdf" : ".mp4, .mov"}`}
                      </p>
                      {isEditMode && !selectedFile && (
                        <p className="text-xs text-orange-500 font-semibold mt-3 bg-orange-50 inline-block px-2 py-1 rounded">
                          Biarkan kosong jika tidak ingin mengganti file lama.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">link</span>
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    required={sourceType === "link"}
                    className={`w-full bg-slate-50 border border-slate-300 rounded-xl pl-12 pr-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:ring-1 ${isEditMode ? 'focus:border-blue-500 focus:ring-blue-500' : 'focus:border-emerald-500 focus:ring-emerald-500'}`}
                    placeholder={uploadData.type === "video" ? "https://youtube.com/watch?v=..." : "https://drive.google.com/file/d/..."}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8 pt-4">
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
                className={`flex-1 py-2.5 text-white font-semibold rounded-xl transition-all shadow-sm text-sm disabled:opacity-50 flex items-center justify-center gap-2 ${
                  isEditMode ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span>
                    {isEditMode ? "Menyimpan..." : "Mengunggah..."}
                  </>
                ) : (
                  isEditMode ? "Simpan Perubahan" : "Mulai Unggah"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
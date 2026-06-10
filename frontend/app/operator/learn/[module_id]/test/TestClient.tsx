"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ModuleData {
  id: number;
  title: string;
}

interface AnswerOption {
  id: number;
  answer_text: string;
}

interface QuestionData {
  id: number;
  question_text: string;
  answers: AnswerOption[];
}

interface TestClientProps {
  moduleData: ModuleData;
  questions: QuestionData[];
  token: string;
}

export default function TestClient({ moduleData, questions, token }: TestClientProps) {
  const router = useRouter();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({}); 
  const [timeLeft, setTimeLeft] = useState(15 * 60); 
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileGridOpen, setIsMobileGridOpen] = useState(false);
  
  // State untuk Modal Konfirmasi Submit
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  
  const [testResult, setTestResult] = useState<{ score: number; passed: boolean; message: string; attempt: number } | null>(null);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const storageKey = `greenfields_test_progress_modul_${moduleData.id}`;

  useEffect(() => {
    const savedAnswers = localStorage.getItem(storageKey);
    if (savedAnswers) {
      try {
        setAnswers(JSON.parse(savedAnswers));
      } catch (e) {
        console.error("Gagal membaca LocalStorage");
      }
    }
    setIsLoaded(true);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ""; 
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [storageKey]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(storageKey, JSON.stringify(answers));
    }
  }, [answers, storageKey, isLoaded]);

  useEffect(() => {
    if (timeLeft <= 0 && !testResult && !isSubmitting) {
      // Jika waktu habis, paksa submit tanpa modal konfirmasi
      executeSubmit(); 
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, testResult, isSubmitting]);

  const currentQuestion = questions[currentIndex];

  const handleSelectAnswer = (questionId: number, answerId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  };

  // Pemicu Modal Konfirmasi
  const handlePreSubmit = () => {
    setIsMobileGridOpen(false); // Tutup drawer navigasi jika di mobile
    setIsConfirmModalOpen(true);
  };

  // Eksekusi Submit yang sesungguhnya
  const executeSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsSubmitting(true);
    try {
      const submitted_answers = Object.entries(answers).map(([qId, aId]) => ({
        question_id: Number(qId),
        answer_id: Number(aId)
      }));

      const payload = {
        module_id: moduleData.id,
        submitted_answers: submitted_answers
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tests/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal menghubungi server");
      }

      const result = await res.json();
      
      localStorage.removeItem(storageKey);
      setTestResult({
        score: result.data.score,
        passed: result.data.is_passed,
        message: result.message,
        attempt: result.data.attempt
      });

    } catch (error: any) {
      alert(error.message || "Koneksi terputus. Jawaban Anda aman. Silakan cari sinyal dan coba kumpulkan lagi.");
      setIsSubmitting(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isTimeCritical = timeLeft <= 60; 

  const unansweredCount = questions.length - Object.keys(answers).length;

  if (questions.length === 0) {
    return <div className="p-8 text-center text-slate-500">Soal belum tersedia untuk modul ini.</div>;
  }

  if (!currentQuestion) return null;

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] pb-24 lg:pb-8 pt-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">

        {/* --- TOOLBAR UJIAN --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:px-6 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                if(confirm("Yakin ingin keluar? Ujian belum selesai. Jawaban Anda akan tersimpan secara otomatis.")) router.push(`/operator/learn/${moduleData.id}`);
              }}
              className="flex items-center justify-center w-10 h-10 bg-slate-100 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors rounded-xl shrink-0"
              title="Keluar Ujian"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-800 line-clamp-1">Post-Test: {moduleData.title}</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Kerjakan dengan jujur dan teliti</p>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-colors shrink-0 ${
            isTimeCritical ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-100"
          }`}>
            <span className={`material-symbols-outlined text-[20px] ${isTimeCritical ? "text-red-600" : "text-emerald-600"}`}>schedule</span>
            <span className={`text-base font-bold tabular-nums ${isTimeCritical ? "text-red-600 animate-pulse" : "text-emerald-700"}`}>
              {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
            </span>
          </div>
        </div>

        {/* --- LAYOUT UTAMA --- */}
        <div className="flex flex-col lg:flex-row gap-6 items-start relative">
          
          {/* AREA SOAL */}
          <div className="w-full lg:w-[70%] bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <span className="px-4 py-1.5 bg-slate-100 rounded-full text-xs font-bold text-slate-600 border border-slate-200">
                Soal Nomor <span className="text-emerald-700">{currentIndex + 1}</span> dari {questions.length}
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 leading-relaxed">
              {currentQuestion.question_text}
            </h2>

            <div className="space-y-4 mb-12 flex-grow">
              {['A', 'B', 'C', 'D'].map((letter, idx) => {
                const opt = currentQuestion.answers[idx];
                if (!opt) return null;

                const isSelected = Number(answers[currentQuestion.id]) === Number(opt.id);

                return (
                  <label 
                    key={opt.id}
                    className={`flex items-center p-4 md:p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 group ${
                      isSelected ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500/20" : "border-slate-200 bg-white hover:border-emerald-400 hover:bg-slate-50"
                    }`}
                  >
                    <input 
                      type="radio" 
                      name={`question-${currentQuestion.id}`} 
                      className="hidden" 
                      checked={isSelected}
                      onChange={() => handleSelectAnswer(currentQuestion.id, opt.id)}
                    />
                    <div className={`w-8 h-8 flex items-center justify-center rounded-lg border-2 text-sm font-bold mr-4 transition-colors shrink-0 ${
                      isSelected ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 text-slate-500 group-hover:border-emerald-400"
                    }`}>
                      {letter}
                    </div>
                    <span className={`text-base md:text-lg ${isSelected ? "font-semibold text-emerald-900" : "text-slate-700"}`}>
                      {opt.answer_text}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-8 mt-auto">
              <button 
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-6 py-3 border border-slate-300 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                <span className="hidden sm:inline">Sebelumnya</span>
              </button>
              
              {/* JIKA SOAL TERAKHIR, MUNCUL TOMBOL KUMPULKAN */}
              {currentIndex === questions.length - 1 ? (
                <button 
                  onClick={handlePreSubmit}
                  className="flex items-center gap-2 px-8 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all active:scale-95 shadow-md animate-in fade-in"
                >
                  <span className="material-symbols-outlined">task_alt</span>
                  <span className="hidden sm:inline">Kumpulkan Ujian</span>
                </button>
              ) : (
                <button 
                  onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all active:scale-95 shadow-sm"
                >
                  <span className="hidden sm:inline">Berikutnya</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              )}
            </div>
          </div>

          {/* AREA NAVIGASI (Sticky Desktop) */}
          <div className={`fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm lg:static lg:bg-transparent lg:backdrop-blur-none lg:flex flex-col lg:w-[30%] lg:sticky lg:top-24 transition-all duration-300 ${isMobileGridOpen ? "flex" : "hidden"}`}>
            <div className="absolute bottom-0 left-0 w-full h-[85vh] lg:h-auto lg:relative bg-white rounded-t-3xl lg:rounded-2xl p-6 shadow-xl lg:shadow-sm border border-slate-200 flex flex-col overflow-y-auto">
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Navigasi Soal</h3>
                  <p className="text-xs font-semibold text-slate-500 mt-1">Status pengerjaan real-time</p>
                </div>
                <button onClick={() => setIsMobileGridOpen(false)} className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-full">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="grid grid-cols-5 gap-3 mb-auto">
                {questions.map((q, idx) => {
                  const isAnswered = !!answers[q.id];
                  const isActive = currentIndex === idx;

                  let btnClass = "w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-all cursor-pointer ";
                  if (isActive) {
                    btnClass += "bg-white border-2 border-emerald-500 text-emerald-600 ring-4 ring-emerald-500/20";
                  } else if (isAnswered) {
                    btnClass += "bg-emerald-500 text-white shadow-sm border border-emerald-600";
                  } else {
                    btnClass += "bg-slate-50 border border-slate-300 text-slate-500 hover:border-emerald-400 hover:bg-white";
                  }

                  return (
                    <button key={q.id} onClick={() => { setCurrentIndex(idx); setIsMobileGridOpen(false); }} className={btnClass}>
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-600"></div>
                  <span className="text-xs font-bold text-slate-600">Terjawab ({Object.keys(answers).length})</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full border-2 border-emerald-500"></div>
                  <span className="text-xs font-bold text-slate-600">Sedang Dikerjakan</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-slate-50 border border-slate-300"></div>
                  <span className="text-xs font-bold text-slate-600">Belum Dijawab ({unansweredCount})</span>
                </div>
              </div>

              {/* Tombol Kumpulkan Digeser ke Paling Bawah (Menempel Footer Area Navigasi) */}
              <div className="mt-auto pt-4">
                <button 
                  onClick={handlePreSubmit}
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                  ) : (
                    <span className="material-symbols-outlined">task_alt</span>
                  )}
                  {isSubmitting ? "Mengirim Jawaban..." : "Kumpulkan Ujian"}
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* --- NAVBAR MOBILE BAWAH (Jika Panel Navigasi Tertutup) --- */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 flex gap-3 z-30 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <button 
          onClick={handlePreSubmit}
          disabled={isSubmitting}
          className="flex-grow py-3.5 bg-emerald-600 text-white rounded-xl font-bold shadow-md disabled:opacity-50"
        >
          {isSubmitting ? "Memproses..." : "Kumpulkan"}
        </button>
        <button 
          onClick={() => setIsMobileGridOpen(true)}
          className="px-5 py-3 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 bg-white shadow-sm flex items-center justify-center relative"
        >
          <span className="material-symbols-outlined">grid_view</span>
          {/* Indikator merah jika ada yang belum dijawab */}
          {unansweredCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          )}
        </button>
      </div>

      {/* --- MODAL KONFIRMASI SUBMIT --- */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center animate-in zoom-in duration-200">
            
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-4 ${
              unansweredCount > 0 ? "bg-orange-50 border-orange-100 text-orange-500" : "bg-emerald-50 border-emerald-100 text-emerald-500"
            }`}>
              <span className="material-symbols-outlined text-[32px]">
                {unansweredCount > 0 ? "warning" : "check_circle"}
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-2">Konfirmasi Pengumpulan</h3>
            
            <p className="text-sm text-slate-500 mb-6">
              {unansweredCount > 0 ? (
                <>Ada <strong className="text-orange-600">{unansweredCount} soal</strong> yang belum Anda jawab. Jawaban kosong akan mendapat nilai 0. Anda yakin ingin mengumpulkan sekarang?</>
              ) : (
                "Seluruh soal telah dijawab. Anda yakin ingin mengakhiri ujian dan mengirim jawaban?"
              )}
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors text-sm"
              >
                Cek Lagi
              </button>
              <button 
                onClick={executeSubmit}
                className="flex-1 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm text-sm"
              >
                Ya, Kumpulkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL HASIL UJIAN --- */}
      {testResult && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-8 text-center animate-in zoom-in duration-300">
            
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 ${
              testResult.passed ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"
            }`}>
              <span className={`material-symbols-outlined text-[40px] ${testResult.passed ? "text-emerald-600" : "text-red-600"}`}>
                {testResult.passed ? "workspace_premium" : "sentiment_dissatisfied"}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {testResult.passed ? "Selamat, Anda Lulus!" : "Maaf, Anda Gagal."}
            </h2>
            
            <div className="text-5xl font-black text-slate-800 my-6">
              {testResult.score}
            </div>

            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              {testResult.message}
              <br/>
              <span className="font-bold mt-2 block">Percobaan ke-{testResult.attempt}</span>
            </p>

            <button 
              onClick={() => {
                if (testResult.passed) {
                  router.push("/operator/my-courses");
                } else {
                  router.push(`/operator/learn/${moduleData.id}`);
                }
              }}
              className={`w-full py-3.5 rounded-xl font-bold text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 ${
                testResult.passed ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {testResult.passed ? "dashboard" : "menu_book"}
              </span>
              {testResult.passed ? "Kembali ke Dashboard" : "Pelajari Ulang Modul"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
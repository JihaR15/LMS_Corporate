"use client";
import React from "react";

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

interface QuestionCardProps {
  question: QuestionData;
  index: number;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  onDeleteClick: (id: number) => void;
  onEditClick: (question: QuestionData) => void; // Tambahan prop edit
}

export default function QuestionCard({ 
  question, 
  index, 
  isSelected, 
  onToggleSelect, 
  onDeleteClick, 
  onEditClick 
}: QuestionCardProps) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-200 ${
      isSelected ? "border-emerald-500 ring-1 ring-emerald-500" : "border-slate-200 hover:border-emerald-300"
    }`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-6 gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="mt-1 shrink-0">
              <input 
                type="checkbox" 
                checked={isSelected}
                onChange={() => onToggleSelect(question.id)}
                className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer transition-all"
              />
            </div>
            <div>
              <span className="inline-block bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-lg text-xs border border-slate-200 mb-3">
                Soal {(index + 1).toString().padStart(2, '0')}
              </span>
              <h3 className="text-lg font-bold text-slate-800 leading-snug">{question.question_text}</h3>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {/* Tombol Edit Baru */}
            <button 
              onClick={() => onEditClick(question)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
              title="Edit Soal"
            >
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
            <button 
              onClick={() => onDeleteClick(question.id)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
              title="Hapus Soal"
            >
              <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-9">
          {['A', 'B', 'C', 'D'].map((letter, letterIdx) => {
            const ans = question.answers[letterIdx];
            if (!ans) return null;

            const isCorrect = ans.is_correct;
            
            return (
              <div key={letter} className={`rounded-xl p-4 flex items-center justify-between transition-all ${
                isCorrect ? "bg-emerald-50 border-2 border-emerald-500 shadow-sm" : "bg-white border border-slate-200"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    isCorrect ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                    {letter}
                  </div>
                  <span className={`text-sm ${isCorrect ? "text-emerald-900 font-semibold" : "text-slate-600"}`}>
                    {ans.answer_text}
                  </span>
                </div>
                {isCorrect && (
                  <span className="material-symbols-outlined text-emerald-600 shrink-0">check_circle</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
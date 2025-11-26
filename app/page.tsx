"use client";

import { useState } from "react";
import { Shield } from "lucide-react";
import { analyzePhishing } from "@/lib/analyzer";
import { AnalysisResult } from "@/lib/types";
import ResultCard from "@/components/ResultCard";

export default function Home() {
  const [emailText, setEmailText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailText.trim()) return;

    setIsAnimating(true);
    setResult(null); // Reset previous result

    // Simulate network/processing delay for UX
    setTimeout(() => {
      const analysisResult = analyzePhishing(emailText);
      setResult(analysisResult);
      setIsAnimating(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-50 font-[family-name:var(--font-inter)]">
      {/* Header */}
      <header className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl shadow-lg mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          PhishGuard
        </h1>
        <p className="text-slate-500 mt-2 text-sm sm:text-base">
          Sistem Pakar Deteksi Email Phishing
        </p>
      </header>

      {/* Main Card */}
      <main className="w-full max-w-xl bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 overflow-hidden">
        <div className="p-8">
          <form onSubmit={handleAnalyze} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                Konten Email
              </label>
              <textarea
                required
                rows={5}
                placeholder="Tempel subject dan isi email di sini..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-slate-700 bg-slate-50/50 placeholder-slate-400 resize-none"
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isAnimating || !emailText.trim()}
              className="w-full py-3.5 px-6 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-slate-300/50 hover:shadow-indigo-500/30 transform active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isAnimating ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Menganalisis...
                </>
              ) : (
                "Cek Keamanan"
              )}
            </button>
          </form>
        </div>

        {/* Result Component */}
        {result && <ResultCard result={result} />}
      </main>

      <footer className="mt-10 text-center text-slate-400 text-xs">
        <p>Kelompok 5</p>
      </footer>
    </div>
  );
}

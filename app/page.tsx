"use client";

import { useState } from "react";
import { Shield, Settings2, Globe, Cpu } from "lucide-react";
import { analyzePhishing } from "@/lib/analyzer";
import { DetectionResult } from "@/lib/types";
import ResultCard from "@/components/ResultCard";

export default function Home() {
  const [emailText, setEmailText] = useState("");
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // --- New States for Mode Switching ---
  const [mode, setMode] = useState<"rule" | "api">("rule");
  const [apiUrl, setApiUrl] = useState(""); // User inputs their ngrok URL here

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailText.trim()) return;

    setIsAnimating(true);
    setResult(null);

    // --- MODE 1: API MODEL ---
    if (mode === "api") {
      if (!apiUrl.trim()) {
        alert("Harap masukkan URL API Ngrok terlebih dahulu.");
        setIsAnimating(false);
        return;
      }

      try {
        // --- URL NORMALIZATION ---
        let targetEndpoint = apiUrl.trim();

        // 1. Hapus trailing slash
        if (targetEndpoint.endsWith("/")) {
          targetEndpoint = targetEndpoint.slice(0, -1);
        }

        // 2. Tambahkan /predict jika belum ada
        if (!targetEndpoint.endsWith("/predict")) {
          targetEndpoint += "/predict";
        }

        console.log("Targeting Backend:", targetEndpoint);

        // --- PERUBAHAN DISINI: HIT NEXT.JS PROXY, BUKAN NGROK LANGSUNG ---
        // Kita kirim URL Ngrok & Teks ke 'jembatan' (Proxy) internal kita
        const response = await fetch("/api/proxy", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            targetUrl: targetEndpoint, // URL Ngrok dikirim sebagai data
            text: emailText,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Gagal menghubungi API");
        }

        // Set Result
        setResult({
          type: "api",
          confidence: data.confidence,
          prediction: data.prediction,
        });
      } catch (error: unknown) {
        let message = "Terjadi kesalahan tak dikenal.";

        if (error instanceof Error) {
          console.error("API Error:", error);
          message = error.message;
        } else {
          console.error("API Error:", error);
        }

        alert(`Error: ${message}. Pastikan URL Ngrok benar & server aktif.`);
      }
    }

    // --- MODE 2: RULE BASED LOGIC (Lokal) ---
    else {
      setTimeout(() => {
        const analysisResult = analyzePhishing(emailText);
        setResult({ ...analysisResult, type: "rule" });
        setIsAnimating(false);
      }, 600);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-50 font-[family-name:var(--font-inter)]">
      {/* Header */}
      <header className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl shadow-lg mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          PhishGuard
        </h1>
        <p className="text-slate-500 mt-2 text-sm sm:text-base">
          Hybrid Detection System: Rule-Based & AI Model
        </p>
      </header>

      {/* Main Card */}
      <main className="w-full max-w-xl bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 overflow-hidden">
        <div className="p-8">
          <form onSubmit={handleAnalyze} className="space-y-6">
            {/* --- 1. Mode Selection (Radio Buttons) --- */}
            <div className="bg-slate-50 p-1.5 rounded-xl flex relative border border-slate-200">
              <button
                type="button"
                onClick={() => setMode("rule")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  mode === "rule"
                    ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Settings2 className="w-4 h-4" />
                Rule-Based Logic
              </button>
              <button
                type="button"
                onClick={() => setMode("api")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  mode === "api"
                    ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Cpu className="w-4 h-4" />
                API Model
              </button>
            </div>

            {/* --- 2. API URL Input (Only visible if Mode == API) --- */}
            {mode === "api" && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 mb-2 block">
                  Base URL Ngrok
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Contoh: https://xxxx.ngrok-free.app (Cukup base URL)"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-slate-700 bg-white placeholder-slate-400 text-sm font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 ml-1">
                  *Sistem akan menggunakan proxy internal untuk menghindari
                  CORS.
                </p>
              </div>
            )}

            {/* --- 3. Text Area Input --- */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                Konten Email
              </label>
              <textarea
                required
                rows={5}
                placeholder={
                  mode === "rule"
                    ? "Sistem akan mengecek kata kunci dan pola URL..."
                    : "Sistem akan mengirim teks ini ke server AI..."
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-slate-700 bg-slate-50/50 placeholder-slate-400 resize-none"
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
              ></textarea>
            </div>

            {/* Submit Button */}
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
                  {mode === "api" ? "Menghubungi Server..." : "Menganalisis..."}
                </>
              ) : mode === "api" ? (
                "Prediksi dengan AI"
              ) : (
                "Cek Rule-Based"
              )}
            </button>
          </form>
        </div>

        {/* Result Component */}
        {result && <ResultCard result={result} />}
      </main>

      <footer className="mt-10 text-center text-slate-400 text-xs">
        <p>© 2024 PhishGuard. Hybrid System.</p>
      </footer>
    </div>
  );
}

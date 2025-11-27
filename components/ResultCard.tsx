import React from "react";
import {
  AlertTriangle,
  CheckCircle,
  Info,
  Link as LinkIcon,
  ShieldCheck,
} from "lucide-react";
import { DetectionResult } from "@/lib/types";

interface ResultCardProps {
  result: DetectionResult;
}

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  // --- LOGIC UNTUK API MODEL ---
  if (result.type === "api") {
    const isPhishing = result.prediction.toUpperCase() === "PHISHING";

    // Warna dinamis berdasarkan Prediksi
    const colorClass = isPhishing ? "text-red-600" : "text-emerald-600";
    const bgClass = isPhishing ? "bg-red-50" : "bg-emerald-50";
    const borderClass = isPhishing ? "border-red-200" : "border-emerald-200";
    const progressBarColor = isPhishing ? "bg-red-600" : "bg-emerald-600";
    const Icon = isPhishing ? AlertTriangle : ShieldCheck;

    return (
      <div
        className={`border-t ${borderClass} bg-slate-50/50 animate-in fade-in slide-in-from-bottom-4 duration-500`}
      >
        <div className={`p-8 ${bgClass} bg-opacity-50`}>
          <div className="flex items-center gap-4 mb-6">
            <div
              className={`p-3 rounded-full bg-white shadow-sm ${colorClass}`}
            >
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-500 uppercase tracking-wider">
                  AI Model Prediction
                </span>
              </div>
              <h2 className={`text-3xl font-bold ${colorClass} tracking-tight`}>
                {result.prediction}
              </h2>
            </div>
          </div>

          {/* Confidence Bar */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Tingkat Keyakinan (Confidence)
              </span>
              <span className={`text-2xl font-bold ${colorClass}`}>
                {result.confidence.toFixed(2)}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-1000 ease-out ${progressBarColor}`}
                style={{ width: `${result.confidence}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-400 mt-3">
              *Hasil ini didapatkan dari prediksi Machine Learning via API.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- LOGIC UNTUK RULE BASED (Kode Lama) ---
  let colorClass = "text-emerald-600";
  let bgClass = "bg-emerald-50";
  let borderClass = "border-emerald-200";
  let Icon = CheckCircle;

  if (result.status === "PHISHING") {
    colorClass = "text-red-600";
    bgClass = "bg-red-50";
    borderClass = "border-red-200";
    Icon = AlertTriangle;
  } else if (result.status === "SUSPICIOUS") {
    colorClass = "text-amber-600";
    bgClass = "bg-amber-50";
    borderClass = "border-amber-200";
    Icon = Info;
  }

  return (
    <div
      className={`border-t ${borderClass} bg-slate-50/50 animate-in fade-in slide-in-from-bottom-4 duration-500`}
    >
      <div className={`p-8 ${bgClass} bg-opacity-50`}>
        <div className="flex items-start gap-4 mb-6">
          <div className={`p-3 rounded-full bg-white shadow-sm ${colorClass}`}>
            <Icon className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-500 uppercase tracking-wider">
                Rule Based Logic
              </span>
            </div>
            <h2 className={`text-2xl font-bold ${colorClass} tracking-tight`}>
              {result.status}
            </h2>
            <p className={`text-sm font-medium ${colorClass} opacity-80`}>
              Risk Score: {result.score.toFixed(2)}
            </p>
          </div>
        </div>

        <p className="text-slate-600 mb-4 text-sm leading-relaxed">
          {result.message}
        </p>

        {result.detectedUrl && (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
            <LinkIcon className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-blue-700 uppercase mb-1">
                Link Terdeteksi
              </p>
              <p
                className="text-sm text-blue-600 truncate font-mono"
                title={result.detectedUrl}
              >
                {result.detectedUrl}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Detail Analisis
          </p>
          <DetailItem
            label={result.details.sbw.label}
            detected={result.details.sbw.detected}
            score={0.4}
          />
          <div
            className={`transition-opacity duration-300 ${
              result.detectedUrl ? "opacity-100" : "opacity-50 grayscale"
            }`}
          >
            <DetailItem
              label={result.details.urlip.label}
              detected={result.details.urlip.detected}
              score={0.3}
              isActive={!!result.detectedUrl}
            />
            <DetailItem
              label={result.details.urld.label}
              detected={result.details.urld.detected}
              score={0.2}
              isActive={!!result.detectedUrl}
            />
            <DetailItem
              label={result.details.urls.label}
              detected={result.details.urls.detected}
              score={0.2}
              isActive={!!result.detectedUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({
  label,
  detected,
  score,
  isActive = true,
}: {
  label: string;
  detected: boolean;
  score: number;
  isActive?: boolean;
}) => (
  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
    <span className="text-sm text-slate-600">{label}</span>
    {detected ? (
      <span className="px-2 py-1 text-xs font-bold text-red-600 bg-red-100 rounded">
        Ya (+{score})
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-bold text-emerald-600 bg-emerald-100 rounded">
        {isActive ? "Aman" : "-"}
      </span>
    )}
  </div>
);

export default ResultCard;

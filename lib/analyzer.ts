import { AnalysisResult } from "./types";
// --- Knowledge Base ---
const blacklistKeywords = [
  "urgent",
  "verify",
  "confirm",
  "password",
  "update",
  "account",
  "reset",
];

const suspiciousSymbols = ["%", "@", "?", "=", "-", "_"];

// --- Helper: URL Extractor ---
export const extractUrl = (text: string): string | null => {
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;
  const matches = text.match(urlRegex);
  return matches ? matches[0] : null;
};

// --- Logic Core (Forward Chaining) ---
export const analyzePhishing = (text: string): AnalysisResult => {
  // 1. Content Analysis (SBW) - Weight 0.4
  const sbwMatch = blacklistKeywords.some((keyword) =>
    text.toLowerCase().includes(keyword)
  );
  const sbw = sbwMatch ? 1 : 0;

  // Init URL factors
  let urlip = 0;
  let urld = 0;
  let urls = 0;

  const detectedUrl = extractUrl(text);

  if (detectedUrl) {
    // 2. URL IP Check (URLIP) - Weight 0.3
    const ipRegex = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
    urlip = ipRegex.test(detectedUrl) ? 1 : 0;

    // 3. Domain Dots Check (URLD) - Weight 0.2
    try {
      let hostname = detectedUrl;
      if (!detectedUrl.startsWith("http")) {
        hostname = `http://${detectedUrl}`;
      }
      const urlObj = new URL(hostname);
      const domain = urlObj.hostname;
      const dotCount = (domain.match(/\./g) || []).length;
      urld = dotCount >= 3 ? 1 : 0;
    } catch (err) {
      // Fallback regex count
      urld = (detectedUrl.match(/\./g) || []).length >= 3 ? 1 : 0;
    }

    // 4. Suspicious Symbols (URLS) - Weight 0.2
    urls = suspiciousSymbols.some((s) => detectedUrl.includes(s)) ? 1 : 0;
  }

  // 5. Calculate Score
  const scoreRaw = sbw * 0.4 + urlip * 0.3 + urld * 0.2 + urls * 0.2;
  const score = parseFloat(scoreRaw.toFixed(2));

  // 6. Decision Rules
  let status: AnalysisResult["status"] = "LEGIT";
  let message = "Konten terlihat aman.";

  if (score >= 0.7) {
    status = "PHISHING";
    message = "Bahaya! Terindikasi kuat sebagai serangan phishing.";
  } else if (score >= 0.4) {
    status = "SUSPICIOUS";
    message = "Hati-hati, terdapat beberapa indikasi mencurigakan.";
  }

  return {
    score,
    status,
    message,
    detectedUrl,
    details: {
      sbw: {
        val: sbw,
        label: "Kata Kunci Berbahaya (Urgent, Verify, dll)",
        detected: sbw === 1,
      },
      urlip: {
        val: urlip,
        label: "URL Menggunakan Alamat IP",
        detected: urlip === 1,
      },
      urld: {
        val: urld,
        label: "Domain URL >3 Titik",
        detected: urld === 1,
      },
      urls: {
        val: urls,
        label: "Simbol URL Mencurigakan (@, %, dll)",
        detected: urls === 1,
      },
    },
  };
};

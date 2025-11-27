import { RuleBasedResult } from "@/lib/types";

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

export const extractUrl = (text: string): string | null => {
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;
  const matches = text.match(urlRegex);
  return matches ? matches[0] : null;
};

export const analyzePhishing = (text: string): RuleBasedResult => {
  const sbwMatch = blacklistKeywords.some((keyword) =>
    text.toLowerCase().includes(keyword)
  );
  const sbw = sbwMatch ? 1 : 0;

  let urlip = 0;
  let urld = 0;
  let urls = 0;

  const detectedUrl = extractUrl(text);

  if (detectedUrl) {
    const ipRegex = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
    urlip = ipRegex.test(detectedUrl) ? 1 : 0;

    try {
      let hostname = detectedUrl;
      if (!detectedUrl.startsWith("http")) {
        hostname = `http://${detectedUrl}`;
      }
      const urlObj = new URL(hostname);
      const domain = urlObj.hostname;
      const dotCount = (domain.match(/\./g) || []).length;
      urld = dotCount >= 3 ? 1 : 0;
    } catch (error: unknown) {
      console.error("URL parsing error:", error);
      urld = (detectedUrl.match(/\./g) || []).length >= 3 ? 1 : 0;
    }

    urls = suspiciousSymbols.some((s) => detectedUrl.includes(s)) ? 1 : 0;
  }

  const scoreRaw = sbw * 0.4 + urlip * 0.3 + urld * 0.2 + urls * 0.2;
  const score = parseFloat(scoreRaw.toFixed(2));

  let status: RuleBasedResult["status"] = "LEGIT";
  let message = "Konten terlihat aman.";

  if (score >= 0.7) {
    status = "PHISHING";
    message = "Bahaya! Terindikasi kuat sebagai serangan phishing.";
  } else if (score >= 0.4) {
    status = "SUSPICIOUS";
    message = "Hati-hati, terdapat beberapa indikasi mencurigakan.";
  }

  return {
    type: "rule",
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

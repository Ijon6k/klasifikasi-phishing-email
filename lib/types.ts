// --- Existing Types (Rule Based) ---
export interface AnalysisDetail {
  val: number;
  label: string;
  detected: boolean;
}

export interface AnalysisDetails {
  sbw: AnalysisDetail;
  urlip: AnalysisDetail;
  urld: AnalysisDetail;
  urls: AnalysisDetail;
}

export interface RuleBasedResult {
  type: "rule";
  score: number;
  status: "PHISHING" | "SUSPICIOUS" | "LEGIT";
  message: string;
  detectedUrl: string | null;
  details: AnalysisDetails;
}

// --- New Type (API Model) ---
export interface ApiResult {
  type: "api";
  prediction: string; // "PHISHING" or "LEGIT" (from JSON)
  confidence: number; // 0 - 100 (from JSON)
}

// Union Type
export type DetectionResult = RuleBasedResult | ApiResult;

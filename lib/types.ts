export interface AnalysisDetail {
  val: number;
  label: string;
  detected: boolean;
}

export interface AnalysisDetails {
  sbw: AnalysisDetail; // Subject/Body Warning
  urlip: AnalysisDetail; // URL is IP
  urld: AnalysisDetail; // URL Domain Dots
  urls: AnalysisDetail; // URL Suspicious Symbols
}

export interface AnalysisResult {
  score: number;
  status: "PHISHING" | "SUSPICIOUS" | "LEGIT";
  message: string;
  detectedUrl: string | null;
  details: AnalysisDetails;
}

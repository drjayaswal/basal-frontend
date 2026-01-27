export interface RadarData {
  subject: string;
  A: number;
  fullMark: number;
}

export interface AnalysisDetails {
  matched_keywords: string[];
  total_matches: number;
  missing_keywords: string[];
  total_lags: number;
  radar_data: RadarData[];
  summary: string;
}

export interface FileData {
  id: string;
  filename: string;
  s3_key?: string; // Made optional for Drive compatibility
  status: "pending" | "processing" | "completed" | "failed";
  match_score: number | null;
  details: AnalysisDetails | null;
  created_at: string;
}
export interface RadarData {
  subject: string;
  A: number;
  fullMark: number;
}
export interface MLAnalysis {
  filename: string;
  match_score: number;
  status: string;
  error?: string;
}
export interface FileData {
  filename: string;
  ml_analysis: {
    match_score: number;
    status: string;
    analysis_details: {
      matched_keywords: string[];
      total_matches: number;
      missing_keywords: string[];
      total_lags: number;
      radar_data: RadarData[];
      summary: string;
    };
  };
}
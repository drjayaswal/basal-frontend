export interface RadarData {
  subject: string;
  A: number;
  fullMark: number;
}

export interface CandidateContact {
  emails: string[];
  phones: string[];
  links: string[];
}

export interface CandidateInfo {
  contact: CandidateContact;
}

export interface UserData {
  email: string;
  id: string;
  updated_at: string;
  authenticated?: boolean;
  credits: number | 0;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface Source {
  id: string;
  source_name: string;
  source_type: "video" | "document";
  status: "pending" | "processing" | "completed" | "failed";
  unique_key: string;
  user_id: string;       
  created_at: string;
  updated_at: string;
}

export interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

export interface SettingsProps {
  user: UserData | null;
}


export interface AnalysisDetails {
    matched_skills: string[];
    total_matched_skills: number
    missing_skills: string[];
    total_missed_skills: number
    unrelated_skills: string[];
    total_unrelated_skills: number;
    jd_noise: string[];
    total_jd_noise: number;
    resume_noise: string[];
    total_resume_noise: number;
    radar_data: {}[]
    summary: string;
}

export interface FileData {
  id: string;
  filename: string;
  s3_key?: string;
  status: "pending" | "processing" | "completed" | "failed";
  match_score: number;
  details: AnalysisDetails | null;
  candidate_info?: CandidateInfo;
  created_at: string;
}
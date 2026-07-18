import { Timestamp } from "firebase/firestore";

export type IssueStatus = "open" | "pending" | "approved";
export type IssuePointStatus = "scored" | "pending_admin_review" | "approved";
export type IssuePointSource = "ai" | "fallback" | "admin";

export type UserProfile = {
  email: string;
  full_name: string;
  profile_photo_url?: string | null;
  total_points: number;
  username?: string | null;
};

export type IssueComment = {
  id: string;
  text: string;
  user_id: string;
  user_name: string;
  created_at_iso: string;
};

export type IssueExtensionStatus = "none" | "requested" | "approved" | "rejected";
export type IssueCategory = "cleanliness" | "facility" | "safety" | "others";

export type IssueRecord = {
  id: string;
  reporter_id: string;
  fixer_id?: string | null;
  status: IssueStatus;
  description: string;
  location?: string | null;
  category?: IssueCategory | null;
  before_photo_url: string;
  before_photo_urls?: string[] | null;
  after_photo_url?: string | null;
  point_value: number;
  created_at?: Timestamp | null;
  reporter_name?: string | null;
  reporter_profile_photo_url?: string | null;
  reporter_username?: string | null;
  claim_expires_at_ms?: number | null;
  claimed_at_ms?: number | null;
  point_status?: IssuePointStatus | null;
  point_source?: IssuePointSource | null;
  point_status_label?: string | null;
  extension_status?: IssueExtensionStatus | null;
  extension_reason?: string | null;
  extension_progress_note?: string | null;
  extension_requested_at_ms?: number | null;
  liked_by?: string[] | null;
  comments?: IssueComment[] | null;
};

export type HazardScore = {
  size_score: number;
  hazard_score: number;
  effort_score: number;
  total_points: number;
  point_status?: IssuePointStatus;
  point_source?: IssuePointSource;
  point_status_label?: string | null;
};

export type RewardItem = {
  item_name: string;
  point_cost: number;
};

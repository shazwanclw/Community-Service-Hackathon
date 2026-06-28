import { Timestamp } from "firebase/firestore";

export type IssueStatus = "open" | "pending" | "approved";

export type UserProfile = {
  email: string;
  full_name: string;
  total_points: number;
};

export type IssueComment = {
  id: string;
  text: string;
  user_id: string;
  user_name: string;
  created_at_iso: string;
};

export type IssueExtensionStatus = "none" | "requested" | "approved" | "rejected";

export type IssueRecord = {
  id: string;
  reporter_id: string;
  fixer_id?: string | null;
  status: IssueStatus;
  description: string;
  before_photo_url: string;
  after_photo_url?: string | null;
  point_value: number;
  created_at?: Timestamp | null;
  reporter_name?: string | null;
  claim_expires_at_ms?: number | null;
  claimed_at_ms?: number | null;
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
};

export type RewardItem = {
  item_name: string;
  point_cost: number;
};

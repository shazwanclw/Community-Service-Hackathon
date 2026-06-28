import { Timestamp } from "firebase/firestore";

export type IssueStatus = "open" | "pending" | "approved";

export type UserProfile = {
  email: string;
  full_name: string;
  total_points: number;
};

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

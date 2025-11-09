export interface OtherUser {
  id: string;
  full_name: string | null;
  username: string | null;
  profile_pic: string | null;
}

export interface Activity {
  id: string;
  type: "paid" | "owed";
  amount: number;
  total_amount: number;
  note: string | null;
  attachment: string | null;
  status: "accepted" | "rejected" | string;
  created_at: string;
  updated_at: string;
  other_user: OtherUser | null;
}

export interface ActivitiesResponse {
  data: Activity[];
  pagination: {
    limit: number;
    page: number;
    totalItems: number;
  };
}

export interface OtherUser {
  id: string;
  full_name: string | null;
  username: string | null;
  profile_pic: string | null;
}

export interface ActivityGroup {
  id: string;
  activity_id: string;
  split_type: "equal" | "exact" | "percentage";
  name: string;
  image: string | null;
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
  group: ActivityGroup | null;
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

export interface GroupActivitySplit {
  activity_id: string | null;
  user_id: string;
  username: string;
  full_name: string;
  profile_pic: string | null;
  amount: number;
  status: "paid" | "pending";
}

export interface GroupActivity {
  id: string;
  paid_by: string;
  paid_by_name: string;
  total_amount: number;
  note: string;
  attachment: string | null;
  split_type: "equal" | "custom";
  member_count: number;
  splits: GroupActivitySplit[];
  created_at: string;
}

export interface GroupActivitiesResponse {
  data: GroupActivity[];
  pagination: {
    limit: number;
    page: number;
    totalItems: number;
  };
}

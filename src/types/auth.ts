export type LoginResponse = {
  otp_id: string;
  email: string;
  message: string;
};



export interface Profile {
  id: string;
  username: string;
  email: string;
  full_name: string;
  profile_pic: string;
  friend_request_status: string | null;
}


export interface DashboardUser {
  id: string;
  username: string;
  full_name: string;
  email: string;
  profile_pic: string;
}

export interface DashboardEntry {
  username: string;
  fullName: string;
  amount: number;
  type: "owed" | "paid";
}

export interface DashboardData {
  totalAmount: number;
  type: "owed" | "paid";
  data: DashboardEntry[];
  current_user: DashboardUser;
}
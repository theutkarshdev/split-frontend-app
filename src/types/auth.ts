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


export type LoginResponse = {
  otp_id: string;
  email: string;
  message: string;
};

// types/notifications.ts
export type Notification = {
  id: number;
  type: "request" | "transaction" | "general";
  subType?: "accepted" | "received" | "rejected" | "credit" | "debit";
  actor: string;
  avatar: string;
  message: string;
  amount?: number; // only for transactions
  timestamp: string;
  isRead: boolean;
};

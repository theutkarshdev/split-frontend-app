export type Notification = {
  id: string;
  type: "friend" | "activity";
  action: "sent" | "accepted" | "declined" | "requested" | "reminder";
  actor_id: string;
  actor_name: string;
  actor_avatar?: string;
  amount?: number;
  activity_title?: string;
  activity_id?: string;
  timestamp: string;
  is_read: boolean;
};

export interface NotificationsApiResponse {
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
  };
}

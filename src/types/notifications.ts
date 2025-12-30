export type NotificationType = "FRIEND" | "ACTIVITY" | "GROUP";

export type NotificationAction =
  | "SENT"
  | "ACCEPTED"
  | "DECLINED"
  | "REQUESTED"
  | "REMINDER"
  | "ADDED_TO_GROUP"
  | "REMOVED_FROM_GROUP"
  | "GROUP_EXPENSE_CREATED"
  | "GROUP_EXPENSE_ACCEPTED"
  | "GROUP_EXPENSE_REJECTED";

export type Notification = {
  id: string;
  type: NotificationType;
  action: NotificationAction;
  actor_id: string;
  actor_name: string;
  actor_avatar: string | null;
  amount: number | null;
  activity_title: string | null;
  activity_id: string | null;
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

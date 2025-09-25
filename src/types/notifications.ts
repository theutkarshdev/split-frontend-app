
export type Notification = {
  id: string | number;
  type: "friend" | "activity";
  action: "sent" | "accepted" | "declined" | "requested" | "reminder";
  actorId: string;
  actorName: string;
  actorAvatar?: string;
  amount?: number;
  activityTitle?: string;
  activityId?: string;
  timestamp: string;
  isRead: boolean;
};

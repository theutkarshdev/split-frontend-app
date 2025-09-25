import React from "react";
import PageHeader from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Notification } from "@/types/notifications";
import AvtarImg from "@/assets/Profile_avatar_placeholder_large.png";

const NotificationsPage: React.FC = () => {

  const notificationsData: Notification[] = [
    {
      id: 1,
      type: "activity",
      action: "reminder", // waiting for approval
      actorId: "user_jhon_123",
      actorName: "Jhon",
      actorAvatar: "https://i.pravatar.cc/150?u=jhon",
      amount: 500, // always positive now
      activityTitle: "Movie Tickets",
      activityId: "act_789",
      timestamp: "2025-09-22T17:00:00Z",
      isRead: false,
    },
    {
      id: 2,
      type: "activity",
      action: "requested",
      actorId: "user_jhon_123",
      actorName: "Jhon",
      actorAvatar: "https://i.pravatar.cc/150?u=jhon",
      amount: 500,
      activityTitle: "Movie Tickets",
      activityId: "act_789",
      timestamp: "2025-09-20T16:30:00Z",
      isRead: false,
    },
    {
      id: 3,
      type: "activity",
      action: "accepted",
      actorId: "user_jhon_123",
      actorName: "Jhon",
      actorAvatar: "https://i.pravatar.cc/150?u=jhon",
      amount: 200,
      activityTitle: "Pizza Party",
      activityId: "act_101",
      timestamp: "2025-09-19T11:00:00Z",
      isRead: true,
    },
    {
      id: 4,
      type: "activity",
      action: "declined",
      actorId: "user_jhon_123",
      actorName: "Jhon",
      actorAvatar: "https://i.pravatar.cc/150?u=jhon",
      amount: 350,
      activityTitle: "Weekend Groceries",
      activityId: "act_102",
      timestamp: "2025-09-19T19:00:00Z",
      isRead: true,
    },
    {
      id: 5,
      type: "friend",
      action: "accepted",
      actorId: "user_jhon_123",
      actorName: "Jhon",
      actorAvatar: "https://i.pravatar.cc/150?u=jhon",
      timestamp: "2025-09-18T18:00:00Z",
      isRead: true,
    },
    {
      id: 5,
      type: "friend",
      action: "sent",
      actorId: "user_jhon_123",
      actorName: "Maria",
      actorAvatar: "https://i.pravatar.cc/150?img=29",
      timestamp: "2025-09-18T18:00:00Z",
      isRead: true,
    },
  ]
  
  const buildNotificationMessage = (item: Notification) => {
    if (item.type === "friend" && item.action === "accepted") {
      return `${item.actorName} accepted your friend request. You are now friends.`;
    }

    if (item.type === "friend" && item.action === "sent") {
      return `${item.actorName} sent you a friend request.`;
    }

    if (item.type === "activity") {
      switch (item.action) {
        case "reminder":
          return `${item.actorName} is waiting for you to approve the ₹${item.amount} expense for '${item.activityTitle}'.`;
        case "requested":
          return `${item.actorName} sent you a ₹${item.amount} expense request for '${item.activityTitle}'.`;
        case "accepted":
          return `${item.actorName} accepted your ₹${item.amount} expense for '${item.activityTitle}'.`;
        case "declined":
          return `${item.actorName} declined your ₹${item.amount} expense for '${item.activityTitle}'.`;
        default:
          return "";
      }
    }

    return "";
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

 const renderNotificationItem = (item: Notification) => {
   const message = buildNotificationMessage(item);

   return (
     <div
       key={item.id}
       className="flex gap-2 border-b items-center p-2 hover:bg-gray-50 transition-colors relative"
     >
       <img
         className="w-10 h-10 object-cover rounded-full"
         src={item.actorAvatar || AvtarImg}
         onError={({ currentTarget }) => {
           currentTarget.onerror = null;
           currentTarget.src = AvtarImg;
         }}
         alt={item.actorName}
         loading="lazy"
       />
       <div className="grow overflow-hidden">
         <div className="flex items-center gap-2">
           <h3 className="text-md font-medium truncate grow">
             {item.actorName}
           </h3>
           <p className="text-xs opacity-55">
             {getRelativeTime(item.timestamp)}
           </p>
         </div>

         <p className="text-xs opacity-65">{message}</p>

       </div>

       {!item.isRead && (
         <span className="size-2 bg-red-400 absolute top-1/2 -left-1 rounded-full -translate-y-1/2"></span>
       )}
     </div>
   );
 };


  const friendNotifications = notificationsData.filter(
    (n) => n.type === "friend"
  );
  const activityNotifications = notificationsData.filter(
    (n) => n.type === "activity"
  );

  return (
    <div>
      <PageHeader title="Notifications" />
      <div className="px-5">
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">
              All{" "}
              <span className="text-xs bg-gray-200 py-0.5 px-1.5 rounded">
                {notificationsData.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="friend">
              Friends{" "}
              <span className="text-xs bg-gray-200 py-0.5 px-1.5 rounded">
                {friendNotifications.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="activity">
              Activity{" "}
              <span className="text-xs bg-gray-200 py-0.5 px-1.5 rounded">
                {activityNotifications.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {notificationsData.map(renderNotificationItem)}
          </TabsContent>

          <TabsContent value="friend">
            {friendNotifications.map(renderNotificationItem)}
          </TabsContent>

          <TabsContent value="activity">
            {activityNotifications.map(renderNotificationItem)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NotificationsPage;

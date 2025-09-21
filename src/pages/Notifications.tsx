import React from "react";
import PageHeader from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Notification } from "@/types/auth";
import AvtarImg from "@/assets/Profile_avatar_placeholder_large.png";

const NotificationsPage: React.FC = () => {
const notificationsData: Notification[] = [
  {
    id: 1,
    type: "request",
    subType: "accepted",
    actor: "Jane Doe",
    avatar: "/path/to/avatar1.png",
    message: "Jane Doe accepted your friend request.",
    timestamp: "5 minutes ago",
    isRead: false,
  },
  {
    id: 2,
    type: "transaction",
    subType: "credit",
    actor: "John Smith",
    avatar: "/path/to/avatar2.png",
    message: "John Smith sent you his share for 'Goa Trip'.",
    amount: 500.0, // +500 credited to you from John Smith
    timestamp: "1 hour ago",
    isRead: false,
  },
  {
    id: 3,
    type: "request",
    subType: "received",
    actor: "Sarah Williams",
    avatar: "/path/to/avatar3.png",
    message: "Sarah Williams sent you a friend request.",
    timestamp: "3 hours ago",
    isRead: true,
  },
  {
    id: 4,
    type: "transaction",
    subType: "debit",
    actor: "Alex Ray",
    avatar: "/path/to/avatar4.png",
    message: "You paid Alex Ray for 'Cinema Tickets'.",
    amount: -250.5, // -250 debited by you to Alex Ray
    timestamp: "1 day ago",
    isRead: true,
  },
  {
    id: 5,
    type: "request",
    subType: "rejected",
    actor: "David Kumar",
    avatar: "/path/to/avatar5.png",
    message: "David Kumar declined your expense split request.",
    timestamp: "2 days ago",
    isRead: true,
  },
  {
    id: 6,
    type: "transaction",
    subType: "credit",
    actor: "Priya Sharma",
    avatar: "/path/to/avatar6.png",
    message: "Priya Sharma settled her share for 'Dinner'.",
    amount: 75.0, // +75 credited to you from Priya
    timestamp: "4 days ago",
    isRead: true,
  },
];


  const renderNotificationItem = (item: Notification) => (
    <div
      key={item.id}
      className="flex gap-2 border-b items-center p-2 hover:bg-gray-50 transition-colors relative"
    >
      <img
        className="size-10 aspect-square object-cover rounded-full"
        src={item.avatar}
        onError={({ currentTarget }) => {
          currentTarget.onerror = null; // prevents looping
          currentTarget.src = AvtarImg;
        }}
        alt={item.actor}
        loading="lazy"
      />
      <div className="grow overflow-hidden">
        <h3 className="text-md font-medium truncate">{item.actor}</h3>
        <p className="text-xs opacity-65 truncate">{item.message}</p>

        {/* Show amount if transaction */}
        {item.type === "transaction" && (
          <p
            className={`text-xs font-semibold mt-1 ${
              item.subType === "credit" ? "text-green-600" : "text-red-600"
            }`}
          >
            {item.amount && item.amount > 0
              ? `+₹${item.amount}`
              : `-₹${Math.abs(item.amount ?? 0)}`}
          </p>
        )}
      </div>
      <p className="text-xs opacity-55 -mt-5">{item.timestamp}</p>

      {!item.isRead && (
        <span className="size-1.5 bg-primary absolute top-1/2 -left-1 rounded-full -translate-y-1/2"></span>
      )}
    </div>
  );

  return (
    <div>
      <PageHeader title="Notifications" />
      <div className="px-5">
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all" className="w-20">
              All
            </TabsTrigger>
            <TabsTrigger value="request">Requests</TabsTrigger>
            <TabsTrigger value="transaction">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {notificationsData.map(renderNotificationItem)}
          </TabsContent>

          <TabsContent value="request">
            {notificationsData
              .filter((n) => n.type === "request")
              .map(renderNotificationItem)}
          </TabsContent>

          <TabsContent value="transaction">
            {notificationsData
              .filter((n) => n.type === "transaction")
              .map(renderNotificationItem)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NotificationsPage;

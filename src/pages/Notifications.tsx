import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type Notification,
  type NotificationsApiResponse,
} from "@/types/notifications";
import AvtarImg from "@/assets/Profile_avatar_placeholder_large.png";
import PageLayout from "@/components/PageLayout";
import axiosInstance from "@/lib/axiosInstance";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { ListChecksIcon } from "lucide-react";
import CustomCard from "@/components/CustomCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";

const NotificationsPage: React.FC = () => {
  const [notificationsData, setNotificationsData] = useState<Notification[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [openMarkAllDialog, setOpenMarkAllDialog] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get<NotificationsApiResponse>(
        "/notifications"
      );
      setNotificationsData(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const navigate = useNavigate();

  const handleNotificationClick = async (item: Notification) => {
    try {
      // Mark notification as read
      if (!item.is_read) {
        await axiosInstance.patch(`/notifications/${item.id}/read`);
        // Optimistic UI update
        setNotificationsData((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
        );
      }

      // Navigate based on type
      if (item.type === "activity" && item.activity_id) {
        navigate(`/activity/${item.actor_id}/${item.activity_id}`);
      } else {
        navigate("/profile/invitation-manager");
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      await axiosInstance.patch("/notifications/read-all");
      // Optimistic UI update
      setNotificationsData((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      toast.success("All notifications marked as read");
      setOpenMarkAllDialog(false);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.error("Failed to mark all as read");
    } finally {
      setMarkingAll(false);
    }
  };

  const buildNotificationMessage = (item: Notification) => {
    if (item.type === "friend" && item.action === "accepted") {
      return `${item.actor_name} accepted your friend request. You are now friends.`;
    }

    if (item.type === "friend" && item.action === "sent") {
      return `${item.actor_name} sent you a friend request.`;
    }

    if (item.type === "activity") {
      switch (item.action) {
        case "reminder":
          return `${item.actor_name} is waiting for you to approve the ₹${item.amount} expense for '${item.activity_title}'.`;
        case "requested":
          return `${item.actor_name} sent you a ₹${item.amount} expense request for '${item.activity_title}'.`;
        case "accepted":
          return `${item.actor_name} accepted your ₹${item.amount} expense for '${item.activity_title}'.`;
        case "declined":
          return `${item.actor_name} declined your ₹${item.amount} expense for '${item.activity_title}'.`;
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
        onClick={() => handleNotificationClick(item)}
        className="flex gap-2 border-b items-center py-2 px-5 bg-card relative"
      >
        <img
          className="size-10 object-cover rounded-full"
          src={item.actor_avatar || AvtarImg}
          onError={({ currentTarget }) => {
            currentTarget.onerror = null;
            currentTarget.src = AvtarImg;
          }}
          alt={item.actor_name}
          loading="lazy"
        />
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium truncate grow">
              {item.actor_name}
            </h3>
            <p className="text-xs opacity-55">
              {getRelativeTime(item.timestamp)}
            </p>
          </div>

          <p className="text-xs opacity-65 truncate ">{message}</p>
        </div>

        {!item.is_read && (
          <span className="size-2 bg-red-400 absolute top-1/2 left-2 rounded-full -translate-y-1/2"></span>
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

  const renderSkeletons = () => (
    <div>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex gap-2 items-center py-2 border-b bg-card px-5"
        >
          <Skeleton className="size-8 rounded-full" />
          <div className="grow space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <PageLayout
      title="My Notifications"
      className="p-0"
      rightElement={
        <button
          type="button"
          aria-label="Mark all as read"
          onClick={() => setOpenMarkAllDialog(true)}
          className="rounded-md"
        >
          <CustomCard
            radius={7}
            pClassName="size-8"
            className="size-full flex items-center justify-center w-full"
          >
            <ListChecksIcon className="size-4" />
          </CustomCard>
        </button>
      }
    >
      <Dialog open={openMarkAllDialog} onOpenChange={setOpenMarkAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark all as read?</DialogTitle>
            <DialogDescription>
              This will mark all your notifications as read. You cannot undo
              this action.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpenMarkAllDialog(false)}
              disabled={markingAll}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleMarkAllRead}
              disabled={markingAll}
            >
              {markingAll ? "Marking..." : "Mark All Read"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Tabs defaultValue="all">
        <div className="p-5 pb-3">
          <TabsList>
            <TabsTrigger value="all">
              All{" "}
              <span className="text-xs bg-gray-200 dark:bg-card py-0.5 px-1.5 rounded">
                {notificationsData.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="friend">
              Friends{" "}
              <span className="text-xs bg-gray-200 dark:bg-card py-0.5 px-1.5 rounded">
                {friendNotifications.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="activity">
              Activity{" "}
              <span className="text-xs bg-gray-200 dark:bg-card py-0.5 px-1.5 rounded">
                {activityNotifications.length}
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all">
          {loading
            ? renderSkeletons()
            : notificationsData.map(renderNotificationItem)}
        </TabsContent>
        <TabsContent value="friend">
          {loading
            ? renderSkeletons()
            : friendNotifications.map(renderNotificationItem)}
        </TabsContent>
        <TabsContent value="activity">
          {loading
            ? renderSkeletons()
            : activityNotifications.map(renderNotificationItem)}
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default NotificationsPage;

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
import {
  CheckCheck,
  Bell,
  Coins,
  UserPlus,
  Clock,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
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
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

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
      if (!item.is_read) {
        await axiosInstance.patch(`/notifications/${item.id}/read`);
        setNotificationsData((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
        );
      }

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

  const unreadCount = notificationsData.filter((n) => !n.is_read).length;

  const buildNotificationMessage = (item: Notification) => {
    if (item.type === "friend") {
      if (item.action === "accepted") {
        return (
          <span>
            <strong className="text-foreground font-semibold">
              {item.actor_name}
            </strong>{" "}
            accepted your friend request. You can now split expenses together.
          </span>
        );
      }
      if (item.action === "sent") {
        return (
          <span>
            <strong className="text-foreground font-semibold">
              {item.actor_name}
            </strong>{" "}
            sent you a friend request. Tap to accept or decline.
          </span>
        );
      }
    }

    if (item.type === "activity") {
      switch (item.action) {
        case "reminder":
          return (
            <span>
              <strong className="text-foreground font-semibold">
                {item.actor_name}
              </strong>{" "}
              sent a reminder for{" "}
              <span className="font-semibold text-foreground">
                '{item.activity_title || "Expense"}'
              </span>
              .
            </span>
          );
        case "requested":
          return (
            <span>
              <strong className="text-foreground font-semibold">
                {item.actor_name}
              </strong>{" "}
              split an expense for{" "}
              <span className="font-semibold text-foreground">
                '{item.activity_title || "Expense"}'
              </span>
              .
            </span>
          );
        case "accepted":
          return (
            <span>
              <strong className="text-foreground font-semibold">
                {item.actor_name}
              </strong>{" "}
              settled the expense for{" "}
              <span className="font-semibold text-foreground">
                '{item.activity_title || "Expense"}'
              </span>
              .
            </span>
          );
        case "declined":
          return (
            <span>
              <strong className="text-foreground font-semibold">
                {item.actor_name}
              </strong>{" "}
              declined the payment for{" "}
              <span className="font-semibold text-foreground">
                '{item.activity_title || "Expense"}'
              </span>
              .
            </span>
          );
        default:
          return <span>New activity update from {item.actor_name}</span>;
      }
    }

    return <span>You have a new update</span>;
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const renderBadge = (item: Notification) => {
    if (item.type === "friend") {
      if (item.action === "accepted") {
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
            <CheckCircle2 className="size-3" /> Connected
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-foreground/80 bg-muted px-2 py-0.5 rounded-md">
          <UserPlus className="size-3" /> Friend Request
        </span>
      );
    }

    if (item.type === "activity") {
      if (item.action === "accepted") {
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
            <CheckCircle2 className="size-3" /> Settled
          </span>
        );
      }
      if (item.action === "declined") {
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md">
            <XCircle className="size-3" /> Declined
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-foreground/80 bg-muted px-2 py-0.5 rounded-md">
          <Coins className="size-3" /> Expense
        </span>
      );
    }

    return null;
  };

  const renderNotificationItem = (item: Notification) => {
    const message = buildNotificationMessage(item);
    const isUnread = !item.is_read;

    return (
      <div
        key={item.id}
        onClick={() => handleNotificationClick(item)}
        className={`group relative flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer active:scale-[0.99] ${
          isUnread
            ? "bg-card border-l-4 border-l-primary border-border/80 dark:border-white/[0.12] shadow-sm hover:border-foreground/30"
            : "bg-card/60 border-border/60 hover:bg-card hover:border-border/80"
        }`}
      >
        {/* Avatar with unread indicator dot */}
        <div className="relative shrink-0 pt-0.5">
          <img
            className="size-11 object-cover rounded-full border border-border/80 ring-2 ring-card"
            src={item.actor_avatar || AvtarImg}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null;
              currentTarget.src = AvtarImg;
            }}
            alt={item.actor_name}
            loading="lazy"
          />
          {isUnread && (
            <span className="size-2.5 bg-emerald-500 rounded-full ring-2 ring-card absolute top-0 right-0 animate-pulse" />
          )}
        </div>

        {/* Content details */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {renderBadge(item)}
              {Boolean(item.amount && item.amount > 0) && (
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-foreground/10 text-foreground">
                  ₹{item.amount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <Clock className="size-3" />
              <span>{getRelativeTime(item.timestamp)}</span>
            </div>
          </div>

          <p className="text-sm text-foreground/90 leading-relaxed font-normal">
            {message}
          </p>
        </div>

        {/* Action arrow indicator */}
        <div className="shrink-0 self-center pl-1 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all">
          <ChevronRight className="size-4.5" />
        </div>
      </div>
    );
  };

  const getFilteredList = (list: Notification[]) => {
    if (filterUnreadOnly) {
      return list.filter((item) => !item.is_read);
    }
    return list;
  };

  const friendNotifications = notificationsData.filter(
    (n) => n.type === "friend"
  );
  const activityNotifications = notificationsData.filter(
    (n) => n.type === "activity"
  );

  const renderSkeletons = () => (
    <div className="space-y-2.5">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="flex gap-3.5 items-center p-4 rounded-2xl border border-border/60 bg-card"
        >
          <Skeleton className="size-11 rounded-full" />
          <div className="grow space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-3 w-14 rounded" />
            </div>
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmptyState = (label: string) => (
    <div className="py-16 text-center space-y-3 bg-card/40 rounded-2xl border border-dashed border-border/80">
      <div className="size-14 rounded-2xl bg-muted/60 grid place-content-center mx-auto text-muted-foreground">
        <Bell className="size-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-foreground">
          {filterUnreadOnly ? "No unread notifications" : "All caught up!"}
        </h3>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
          {filterUnreadOnly
            ? "You don't have any unread updates at this moment."
            : `No ${label} notifications to display.`}
        </p>
      </div>
      {filterUnreadOnly && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilterUnreadOnly(false)}
          className="rounded-xl text-xs h-9 px-4 cursor-pointer mt-1"
        >
          View all notifications
        </Button>
      )}
    </div>
  );

  return (
    <PageLayout
      title="Notifications"
      className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6"
    >
      {/* Top Status & Fast Action Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/80 dark:border-white/[0.08] shadow-xs gap-3">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-muted text-foreground grid place-content-center shrink-0">
            <Bell className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">
                Activity Feed
              </h2>
              {unreadCount > 0 ? (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  {unreadCount} unread
                </span>
              ) : (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  Up to date
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Friend invitations, expense splits, and settlement notices
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant={filterUnreadOnly ? "default" : "outline"}
            onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
            className="h-10 px-3.5 text-xs font-semibold rounded-xl cursor-pointer"
          >
            {filterUnreadOnly ? "Showing Unread" : "Unread Only"}
          </Button>

          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setOpenMarkAllDialog(true)}
              className="h-10 px-3.5 text-xs font-semibold rounded-xl text-primary hover:text-primary hover:bg-primary/10 cursor-pointer flex items-center gap-1.5"
            >
              <CheckCheck className="size-4" /> Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="w-full bg-muted/60 p-1.5 rounded-xl h-auto grid grid-cols-3">
          <TabsTrigger
            value="all"
            className="rounded-lg text-xs font-semibold py-2.5 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all"
          >
            All{" "}
            <span className="ml-1 text-[11px] opacity-75 font-mono">
              ({getFilteredList(notificationsData).length})
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="rounded-lg text-xs font-semibold py-2.5 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all"
          >
            Expenses{" "}
            <span className="ml-1 text-[11px] opacity-75 font-mono">
              ({getFilteredList(activityNotifications).length})
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="friend"
            className="rounded-lg text-xs font-semibold py-2.5 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all"
          >
            Friends{" "}
            <span className="ml-1 text-[11px] opacity-75 font-mono">
              ({getFilteredList(friendNotifications).length})
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-2.5 mt-0">
          {loading ? (
            renderSkeletons()
          ) : getFilteredList(notificationsData).length === 0 ? (
            renderEmptyState("general")
          ) : (
            getFilteredList(notificationsData).map(renderNotificationItem)
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-2.5 mt-0">
          {loading ? (
            renderSkeletons()
          ) : getFilteredList(activityNotifications).length === 0 ? (
            renderEmptyState("expense")
          ) : (
            getFilteredList(activityNotifications).map(renderNotificationItem)
          )}
        </TabsContent>

        <TabsContent value="friend" className="space-y-2.5 mt-0">
          {loading ? (
            renderSkeletons()
          ) : getFilteredList(friendNotifications).length === 0 ? (
            renderEmptyState("friend")
          ) : (
            getFilteredList(friendNotifications).map(renderNotificationItem)
          )}
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={openMarkAllDialog} onOpenChange={setOpenMarkAllDialog}>
        <DialogContent className="max-w-xs p-5 bg-card border border-border/80 dark:border-white/[0.12] rounded-2xl shadow-xl">
          <DialogHeader className="text-left space-y-1.5">
            <DialogTitle className="text-base font-bold">
              Mark all as read?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              This will clear the unread indicator for all {unreadCount} current notifications.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2.5 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpenMarkAllDialog(false)}
              disabled={markingAll}
              className="flex-1 rounded-xl text-xs font-semibold h-10 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="flex-1 rounded-xl text-xs font-semibold h-10 bg-primary cursor-pointer shadow-sm"
            >
              {markingAll ? "Marking..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default NotificationsPage;

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  CheckCircle2,
  Clock,
  Plus,
  Send,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  XCircle,
  PieChart as PieIcon,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PageLayout from "@/components/PageLayout";
import CustomCard from "@/components/CustomCard";
import NoDataFound from "@/components/NoDataFound";

import axiosInstance from "@/lib/axiosInstance";
import { formatDateTime } from "@/lib/utils";

import type { DashboardData, Profile } from "@/types/auth";
import type { ActivitiesResponse, Activity } from "@/types/activity";

import AvtarImg from "@/assets/Profile_avatar_placeholder_large.png";
import { ChartPieDonutText } from "@/components/PieChart";

const Dashboard = () => {
  const navigate = useNavigate();

  // --- State Management ---
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setDashboardLoading(true);
    try {
      const res = await axiosInstance.get("/profile/dashboard");
      if (Array.isArray(res.data.data)) {
        setDashboard(res.data);
      } else {
        setDashboard(null);
      }
    } catch (err: any) {
      console.error("Fetch dashboard error:", err);
      setDashboard(null);
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  const fetchFriends = useCallback(async () => {
    setFriendsLoading(true);
    try {
      const res = await axiosInstance.get("/friends");
      if (Array.isArray(res.data)) {
        setProfiles(res.data);
      } else {
        setProfiles([]);
      }
    } catch (err: any) {
      console.error("Fetch friends error:", err);
      setProfiles([]);
    } finally {
      setFriendsLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async (pageNum = 1) => {
    setActivitiesLoading(true);
    setActivitiesError(null);
    try {
      const res = await axiosInstance.get<ActivitiesResponse>(
        `/activities/my-history?limit=8&page=${pageNum}`
      );

      const newData = res.data?.data || [];
      if (pageNum === 1) {
        setActivities(newData);
      } else {
        setActivities((prev) => [...prev, ...newData]);
      }
    } catch (error: any) {
      console.error("Fetch history error:", error);
      setActivities([]);
      setActivitiesError(
        error?.response?.data?.message ||
          "Could not load activities. Please try again."
      );
    } finally {
      setActivitiesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchFriends();
    fetchHistory(1);
  }, [fetchDashboardData, fetchFriends, fetchHistory]);

  const isOwed = dashboard?.type === "owed";
  const totalAmount = dashboard?.totalAmount ?? 0;

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="size-3" /> Settled
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
            <XCircle className="size-3" /> Rejected
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
            <Clock className="size-3" /> Pending
          </span>
        );
    }
  };

  return (
    <PageLayout className="p-4 sm:p-6 lg:p-8 pb-14 sm:pb-16 max-w-7xl mx-auto space-y-6">
      {/* Welcome Greeting on Mobile & Desktop */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
            {dashboard?.current_user?.full_name ? (
              <>Hey, {dashboard.current_user.full_name} 👋</>
            ) : (
              "Dashboard"
            )}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Your expense balances, settlements, and recent activities.
          </p>
        </div>

        {/* Desktop Quick Settle Action */}
        <div className="hidden lg:flex items-center gap-3">
          <Button
            size="default"
            onClick={() => navigate("/search?friend_filter=all")}
            className="rounded-xl px-5 h-11 text-sm font-bold shadow-xs cursor-pointer flex items-center gap-2"
          >
            <Plus className="size-4" /> Split Bill
          </Button>
          <Button
            size="default"
            variant="outline"
            onClick={() => navigate("/search?friend_filter=friends")}
            className="rounded-xl px-5 h-11 text-sm font-bold border-border hover:bg-muted cursor-pointer flex items-center gap-2"
          >
            <Send className="size-4" /> Settle Up
          </Button>
        </div>
      </div>

      {/* Main Grid: Responsive 12-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Hero Card & Recent Activities) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Financial Balance Hero Card (Clean Grey Finish) */}
          <CustomCard
            radius={22}
            className="p-5 sm:p-7 border border-border/80 dark:border-white/[0.1] bg-card shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {isOwed ? "Total You Are Owed" : "Total You Owe"}
                </span>
                <div className="flex items-baseline gap-2.5 mt-1.5">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
                    ₹{totalAmount.toLocaleString()}
                  </span>
                  <span
                    className={`text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      isOwed
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {isOwed ? (
                      <>
                        <TrendingUp className="size-3.5" /> To Receive
                      </>
                    ) : (
                      <>
                        <TrendingDown className="size-3.5" /> To Pay
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Action Buttons with Increased Padding */}
              <div className="flex items-center gap-2.5 sm:self-center">
                <Button
                  size="default"
                  onClick={() => navigate("/search?friend_filter=all")}
                  className="rounded-xl px-5 h-11 text-xs sm:text-sm font-bold shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Plus className="size-4" /> Split Bill
                </Button>
                <Button
                  size="default"
                  variant="outline"
                  onClick={() => navigate("/search?friend_filter=friends")}
                  className="rounded-xl px-5 h-11 text-xs sm:text-sm font-bold border-border/80 hover:bg-muted cursor-pointer flex items-center gap-2"
                >
                  <Send className="size-3.5" /> Settle
                </Button>
              </div>
            </div>

            {/* Mobile Donut Visualizer */}
            <div className="lg:hidden mt-5 pt-5 border-t border-border/70 min-h-[170px] flex items-center justify-center">
              <ChartPieDonutText loading={dashboardLoading} data={dashboard} />
            </div>
          </CustomCard>

          {/* Friends Section */}
          <CustomCard radius={20} className="p-4 sm:p-6 shadow-xs border border-border/80">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2.5">
                <Users className="size-4.5 text-foreground" />
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                  Friends
                </h2>
                <span className="text-xs font-bold text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                  {profiles.length}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => navigate("/search?friend_filter=friends")}
              >
                See all
              </Button>
            </div>

            {/* Horizontal Scroll Tray */}
            <div className="flex items-center gap-4 overflow-x-auto pb-1 pt-1 no-scrollbar scroll-smooth">
              {/* Add Friend Trigger */}
              <div
                className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
                onClick={() => navigate("/search?friend_filter=all")}
              >
                <div className="size-14 rounded-full border-2 border-dashed border-border group-hover:border-foreground flex items-center justify-center transition-colors">
                  <UserPlus className="size-5 text-muted-foreground group-hover:text-foreground" />
                </div>
                <span className="text-xs font-semibold text-foreground/80 truncate max-w-[56px] text-center">
                  Add
                </span>
              </div>

              {/* Skeletons */}
              {friendsLoading &&
                [...Array(6)].map((_, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5 shrink-0">
                    <Skeleton className="size-14 rounded-full" />
                    <Skeleton className="h-3 w-12 rounded-full" />
                  </div>
                ))}

              {/* Friend Avatar Items */}
              {!friendsLoading &&
                profiles.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
                    onClick={() => {
                      const status = friend.friend_request_status;
                      if (status === undefined || status === "accepted") {
                        navigate(`/activity/${friend.id}`);
                      }
                    }}
                  >
                    <div className="size-14 rounded-full p-0.5 border border-border group-hover:border-foreground/50 transition-colors relative">
                      <img
                        className="size-full object-cover rounded-full"
                        src={friend.profile_pic || AvtarImg}
                        alt={friend.username}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = AvtarImg;
                        }}
                      />
                      <span className="absolute bottom-0 right-0 size-3.5 rounded-full bg-emerald-500 ring-2 ring-card" />
                    </div>
                    <span className="text-xs font-semibold text-foreground/85 truncate max-w-[65px] text-center">
                      {friend.full_name?.split(" ")[0] || friend.username}
                    </span>
                  </div>
                ))}

              {!friendsLoading && profiles.length === 0 && (
                <p className="text-xs sm:text-sm text-muted-foreground py-2 pl-2">
                  No friends added yet. Tap Add to invite friends.
                </p>
              )}
            </div>
          </CustomCard>

          {/* Recent Activity Feed */}
          <CustomCard radius={20} className="p-4 sm:p-6 shadow-xs border border-border/80">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                  Recent Transactions
                </h2>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Latest activity across your shared expenses
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => navigate("/profile/history")}
              >
                View all
              </Button>
            </div>

            <div className="space-y-3">
              {activitiesLoading &&
                [...Array(4)].map((_, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-border/60 flex items-center gap-3.5"
                  >
                    <Skeleton className="size-11 rounded-full" />
                    <div className="grow space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}

              {!activitiesLoading && activities.length === 0 && (
                <NoDataFound isBorder={false} errorMsg={activitiesError} />
              )}

              {!activitiesLoading &&
                activities.map((activity) => {
                  const isPaid = activity.type === "paid";
                  return (
                    <div
                      key={activity.id}
                      onClick={() =>
                        activity.other_user &&
                        navigate(
                          `/activity/${activity.other_user.id}/${activity.id}`
                        )
                      }
                      className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-border/80 dark:border-white/[0.08] bg-card hover:bg-muted/40 transition-all cursor-pointer active:scale-99 shadow-xs"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 pr-3">
                        <img
                          className="size-11 rounded-full object-cover shrink-0 border border-border"
                          src={activity.other_user?.profile_pic ?? AvtarImg}
                          alt={activity.other_user?.full_name ?? "User"}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = AvtarImg;
                          }}
                        />

                        <div className="min-w-0 space-y-0.5">
                          <h3 className="text-xs sm:text-sm font-bold text-foreground truncate">
                            {activity.other_user?.full_name ||
                              activity.other_user?.username ||
                              "Unknown"}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {activity.note ||
                              (isPaid ? "Payment settled" : "Expense shared")}
                          </p>
                          <span className="text-[11px] text-muted-foreground/75 block sm:hidden">
                            {formatDateTime(activity.created_at)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <span className="text-xs text-muted-foreground hidden sm:inline-block">
                          {formatDateTime(activity.created_at)}
                        </span>

                        <div className="text-right flex flex-col items-end gap-1">
                          <span
                            className={`text-sm sm:text-base font-bold tabular-nums ${
                              isPaid
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-500 dark:text-rose-400"
                            }`}
                          >
                            {isPaid ? "+" : "-"}₹{activity.amount ?? 0}
                          </span>
                          {renderStatusBadge(activity.status)}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CustomCard>
        </div>

        {/* Right Column (Desktop Only: Clean Donut Widget & Quick Friend Settlement) */}
        <div className="hidden lg:block lg:col-span-5 xl:col-span-4 space-y-6">
          <CustomCard radius={22} className="p-6 border border-border/80 dark:border-white/[0.1] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PieIcon className="size-4.5 text-foreground" />
                <h2 className="text-base font-bold tracking-tight text-foreground">
                  Expense Breakdown
                </h2>
              </div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Distribution
              </span>
            </div>

            <div className="min-h-[220px] flex items-center justify-center pt-2 pb-1">
              <ChartPieDonutText loading={dashboardLoading} data={dashboard} />
            </div>

            <div className="mt-4 pt-3 border-t border-border/60 text-center">
              <p className="text-xs text-muted-foreground">
                Distribution of expenses across your active contacts
              </p>
            </div>
          </CustomCard>

          {/* Quick Friend Settle on Desktop */}
          <CustomCard radius={22} className="p-6 border border-border/80 dark:border-white/[0.1] shadow-xs">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Quick Settle
              </h3>
              <button
                type="button"
                onClick={() => navigate("/search?friend_filter=friends")}
                className="text-xs font-semibold text-foreground hover:underline cursor-pointer"
              >
                View all
              </button>
            </div>

            <div className="space-y-2">
              {profiles.slice(0, 5).map((friend) => (
                <div
                  key={friend.id}
                  onClick={() => navigate(`/activity/${friend.id}`)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={friend.profile_pic || AvtarImg}
                      alt={friend.username}
                      className="size-9 rounded-full object-cover border border-border"
                    />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                        {friend.full_name || friend.username}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate font-mono">
                        @{friend.username}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
              ))}

              {profiles.length === 0 && (
                <p className="text-xs sm:text-sm text-muted-foreground py-2 text-center">
                  Add friends to see quick settlement options here.
                </p>
              )}
            </div>
          </CustomCard>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;

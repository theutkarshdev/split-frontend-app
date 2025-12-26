import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  BellIcon,
  CircleAlertIcon,
  IndianRupeeIcon,
  PlusIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PageLayout from "@/components/PageLayout";
import CustomCard from "@/components/CustomCard";
import NoDataFound from "@/components/NoDataFound";
import axiosInstance from "@/lib/axiosInstance";
import { formatDateTime } from "@/lib/utils";
import type { DashboardData, Profile } from "@/types/auth";
import type { ActivitiesResponse, Activity } from "@/types/activity";
import { ChartPieDonutText } from "@/components/PieChart";
import { getInitials } from "@/lib/helpers";

const Dashboard = () => {
  const navigate = useNavigate();

  // --- State Management ---
  const [notification, setNotification] = useState(0);
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
      console.error("Fetch friends error:", err);
      setDashboard(null);
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  // --- Fetch unread notifications ---
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/notifications/unread-count");
      if (res.status === 200) {
        setNotification(res.data.unread_count || 0);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, []);

  // --- Fetch friends ---
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

  // --- Fetch activities ---
  const fetchHistory = useCallback(async (pageNum = 1) => {
    setActivitiesLoading(true);
    setActivitiesError(null);
    try {
      const res = await axiosInstance.get<ActivitiesResponse>(
        `/activities/my-history?limit=5&page=${pageNum}`
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

  // --- Initial Load ---
  useEffect(() => {
    fetchDashboardData();
    fetchUnreadCount();
    fetchFriends();
    fetchHistory(1);
  }, [fetchUnreadCount, fetchFriends, fetchHistory]);

  // --- Status Badge Renderer ---
  const getStatusText = (status: string) => {
    switch (status) {
      case "rejected":
        return (
          <p className="text-xs flex items-center gap-1 text-red-400">
            Rejected <CircleAlertIcon className="size-3" />
          </p>
        );
      case "pending":
        return (
          <p className="text-xs flex items-center gap-1 text-yellow-600">
            Pending <CircleAlertIcon className="size-3" />
          </p>
        );
      default:
        return null;
    }
  };

  return (
    <PageLayout className="p-0">
      {/* --- Header --- */}
      <div className="h-[41svh] relative">
        <CustomCard
          radius={35}
          className="p-5 pb-4 h-full flex flex-col"
          pClassName="absolute h-[calc(40svh+5rem)] w-full right-5 translate-x-5 -top-14"
        >
          <div className="flex gap-3 items-center mb-4 mt-14">
            <h1 className="text-xl grow font-semibold">
              Hey, {dashboard?.current_user?.full_name}
            </h1>
            <Button
              size="icon"
              onClick={() => navigate("/notifications")}
              className="relative rounded-full !bg-card border"
            >
              <BellIcon className="size-5 text-primary" />
              {notification > 0 && (
                <span className="size-2 bg-red-400 absolute top-2 right-2 rounded-full" />
              )}
            </Button>
          </div>

          <div className="flex-1 grow overflow-hidden border-t border-b border-dashed">
            <ChartPieDonutText loading={dashboardLoading} data={dashboard} />
          </div>
          <p className="text-xs pt-4 text-center">
            Summary of amounts by person
          </p>
        </CustomCard>
      </div>

      {/* --- Content --- */}
      <div className="p-5">
        {/* --- My Friends Card --- */}
        <CustomCard className="p-5" pClassName="mt-5" radius={25}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">My Friends</h2>
            <Button
              variant="ghost"
              className="p-0 opacity-50 h-5"
              onClick={() => navigate("/search?friend_filter=friends")}
            >
              See All
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-5 gap-2">
            {/* Add Friend Button */}
            <div
              className="text-center cursor-pointer"
              onClick={() => navigate("/search?friend_filter=all")}
            >
              <CustomCard
                radius={50}
                className="w-full aspect-square grid place-content-center"
              >
                <PlusIcon className="size-10 text-zinc-300 dark:text-zinc-700" />
              </CustomCard>
              <h3 className="text-xs font-medium mt-2 truncate">Add</h3>
            </div>

            {/* Loading State */}
            {friendsLoading &&
              [...Array(9)].map((_, idx) => (
                <div key={idx}>
                  <CustomCard radius={50} className="w-full aspect-square">
                    <Skeleton className="size-full rounded-full" />
                  </CustomCard>
                  <Skeleton className="h-3 w-[90%] mt-2 mx-auto" />
                </div>
              ))}

            {/* Loaded State */}
            {!friendsLoading &&
              profiles.map((friend) => (
                <div
                  key={friend.id}
                  className="text-center cursor-pointer"
                  onClick={() => {
                    const status = friend.friend_request_status;
                    if (status === undefined || status === "accepted") {
                      navigate(`/activity/${friend.id}`);
                    }
                  }}
                >
                  <CustomCard radius={50} className="w-full aspect-square">
                    <Avatar className="size-full">
                      <AvatarImage
                        src={friend.profile_pic}
                        alt={friend.username}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        {getInitials(friend.full_name, "F")}
                      </AvatarFallback>
                    </Avatar>
                  </CustomCard>
                  <h3 className="text-xs font-medium mt-2 truncate">
                    {friend.full_name?.split(" ")[0] || "Friend"}
                  </h3>
                </div>
              ))}
          </div>
        </CustomCard>

        {/* --- Recent Activities Card --- */}
        <CustomCard className="p-5" pClassName="mt-5" radius={25}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Recent Activities</h2>
            <Button
              variant="ghost"
              className="p-0 opacity-50 h-5"
              onClick={() => navigate("/profile/history")}
            >
              See All
            </Button>
          </div>

          <div className="mt-4 space-y-2">
            {/* Loading State */}
            {activitiesLoading &&
              [...Array(5)].map((_, idx) => (
                <CustomCard key={idx} radius={15} className="p-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="grow">
                      <Skeleton className="h-4 w-1/3 mb-1" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-4 w-10" />
                  </div>
                </CustomCard>
              ))}

            {/* Error / Empty State */}
            {!activitiesLoading && activities.length === 0 && (
              <NoDataFound isBorder={false} errorMsg={activitiesError} />
            )}

            {/* Loaded Activities */}
            {!activitiesLoading &&
              activities.map((activity) => (
                <CustomCard
                  key={activity.id}
                  radius={15}
                  className="flex gap-2 items-center p-3 cursor-pointer"
                  onClick={() =>
                    activity.other_user &&
                    navigate(
                      `/activity/${activity.other_user.id}/${activity.id}`
                    )
                  }
                >
                  <Avatar className="size-10">
                    <AvatarImage
                      src={activity.other_user?.profile_pic || undefined}
                      alt={activity.other_user?.full_name ?? "No Name"}
                      className="object-cover"
                    />
                    <AvatarFallback>
                      {getInitials(activity.other_user?.full_name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="grow overflow-hidden">
                    <h3 className="text-md font-medium truncate">
                      {activity.other_user?.username ?? "Unknown User"}
                    </h3>
                    <p className="text-xs capitalize opacity-65 truncate">
                      {activity.other_user?.full_name ?? "No Name"}
                    </p>
                    <p className="text-[9px] text-gray-500">
                      {formatDateTime(activity.created_at)}
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm font-semibold flex items-center justify-end ${
                        activity.type === "paid"
                          ? "text-green-500"
                          : "text-red-400"
                      }`}
                    >
                      <IndianRupeeIcon className="size-3" />
                      {activity.amount ?? 0}
                    </span>
                    {getStatusText(activity.status)}
                  </div>
                </CustomCard>
              ))}
          </div>
        </CustomCard>
      </div>
    </PageLayout>
  );
};

export default Dashboard;

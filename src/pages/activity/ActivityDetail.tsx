import { useEffect, useState } from "react";
import { useParams } from "react-router";
import axiosInstance from "@/lib/axiosInstance";
import CustomCard from "@/components/CustomCard";
import PageLayout from "@/components/PageLayout";
import { Skeleton } from "@/components/ui/skeleton";

type User = {
  id: string;
  full_name: string;
  username: string;
  email: string;
  profile_pic: string;
};

type ActivityDetail = {
  id: string;
  type: "paid" | "received";
  amount: number;
  total_amount: number;
  note: string;
  attachment?: string;
  status: string;
  created_at: string;
  updated_at: string;
  current_user: User;
  other_user: User;
};

const ActivityDetail = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const [activityData, setActivityData] = useState<ActivityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axiosInstance.get<ActivityDetail>(
          `/activities/${activityId}`
        );

        setActivityData(res.data);
      } catch (err: any) {
        console.error("Error fetching activity data:", err);
        setError(
          err?.response?.data?.message || "Failed to load activity details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (activityId) fetchActivityData();
  }, [activityId]);

  if (loading) {
    return (
      <PageLayout title="Activity Details" isNav={false}>
        <div className="space-y-5">
          {/* Amount Card Skeleton */}
          <div className="p-5 space-y-3 bg-card border rounded-2xl">
            <div className="grid grid-cols-2 mb-4">
              <div>
                <Skeleton className="h-5 w-20 mb-2" />
                <Skeleton className="h-8 w-24" />
              </div>
              <div className="border-l-2 pl-6">
                <Skeleton className="h-5 w-28 mb-2" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
            <Skeleton className="h-5 w-3/4" />
          </div>

          {/* User Card Skeleton */}
          <div className="p-5 space-y-5 bg-card border rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
            <Skeleton className="h-8 w-28" />
            <div className="flex items-center justify-between pt-4">
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
            <Skeleton className="h-3 w-48 mt-3" />
          </div>

          {/* Attachment Skeleton */}
          <div className="p-5 bg-card border rounded-2xl">
            <Skeleton className="h-4 w-32 mb-3" />
            <Skeleton className="h-52 w-full rounded-lg" />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Activity Details" isNav={false}>
        <div className="text-center text-red-500 font-medium py-10">
          {error}
        </div>
      </PageLayout>
    );
  }

  if (!activityData) {
    return (
      <PageLayout title="Activity Details" isNav={false}>
        <div className="text-center text-gray-500 py-10">No data found.</div>
      </PageLayout>
    );
  }

  const isPaid = activityData.type === "paid";
  const fromUser = isPaid ? activityData.current_user : activityData.other_user;
  const toUser = isPaid ? activityData.other_user : activityData.current_user;

  return (
    <PageLayout title="Activity Details" isNav={false}>
      <div className="space-y-5">
        {/* Amount Details */}
        <CustomCard radius={19} className="p-5">
          <div className="grid grid-cols-2 mb-3">
            <div>
              <h2 className="text-sm font-bold mb-1">Amount</h2>
              <p
                className={`text-2xl font-bold mb-3 ${
                  activityData.type === "paid"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                ₹ {activityData.amount}
              </p>
            </div>
            <div className="border-l-2 pl-5">
              <h2 className="text-sm font-bold mb-1">Total Amount</h2>
              <p className="text-2xl font-bold mb-3">
                ₹ {activityData.total_amount}
              </p>
            </div>
          </div>

          {activityData.note && (
            <p className="text-sm mb-3">Note: {activityData.note}</p>
          )}
        </CustomCard>

        {/* User Details */}
        <CustomCard radius={19} className="p-5">
          {/* To */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold mb-1">To</h2>
              <p className="text-md font-bold">{toUser.full_name}</p>
              <p className="text-xs text-gray-500">@{toUser.username}</p>
            </div>
            <img
              className="size-12 object-cover rounded-full border"
              src={toUser.profile_pic}
              alt={toUser.username}
            />
          </div>

          <div className="flex text-sm font-normal gap-2 pt-3 pb-5">
            <button className="border text-xs font-normal px-3 py-2 rounded-md cursor-pointer hover:bg-muted transition">
              View History
            </button>
          </div>

          <hr />

          {/* From */}
          <div className="pt-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold mb-1">From</h2>
              <p className="text-md font-bold">{fromUser.full_name}</p>
              <p className="text-xs text-gray-500">@{fromUser.username}</p>
            </div>
            <img
              className="size-12 object-cover rounded-full border"
              src={fromUser.profile_pic}
              alt={fromUser.username}
            />
          </div>

          <div className="pt-3 text-xs text-gray-500">
            <p>Date: {new Date(activityData.created_at).toLocaleString()}</p>
            <p>Ref No: {activityData.id}</p>
          </div>
        </CustomCard>

        {/* Attachment */}
        {activityData.attachment && (
          <CustomCard radius={19} className="p-5">
            <h2 className="text-sm font-bold mb-3">Receipt Image:</h2>
            <CustomCard radius={19}>
              <img
                className="w-full h-60 object-cover rounded-lg"
                src={activityData.attachment}
                alt="Receipt"
                loading="lazy"
              />
            </CustomCard>
          </CustomCard>
        )}
      </div>
    </PageLayout>
  );
};

export default ActivityDetail;

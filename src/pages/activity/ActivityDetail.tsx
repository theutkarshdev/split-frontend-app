import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate, useParams } from "react-router";
import axiosInstance from "@/lib/axiosInstance";
import CustomCard from "@/components/CustomCard";
import PageLayout from "@/components/PageLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { DialogClose } from "@radix-ui/react-dialog";
import { CheckIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/helpers";

type User = {
  id: string;
  full_name: string;
  username: string;
  email: string;
  profile_pic: string;
};

type ActivityDetail = {
  id: string;
  type: "paid" | "owed";
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
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

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

  const handleStatusUpdate = async (
    activity_id: string,
    status: "accepted" | "rejected"
  ) => {
    setLoading(true);
    try {
      await axiosInstance.patch(`/activities/${activity_id}/status`, {
        status,
      });
      toast.success(`Activity ${status}`);
      fetchActivityData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
  const isOwed = activityData.type === "owed";
  const fromUser = isPaid ? activityData.current_user : activityData.other_user;
  const toUser = isPaid ? activityData.other_user : activityData.current_user;

  return (
    <PageLayout title="Activity Details" isNav={false}>
      <div className="space-y-5">
        {/* Amount Details */}
        <CustomCard radius={19} pClassName="relative" className="p-5">
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
                ₹ {activityData.amount.toString().slice(0, 8)}
              </p>
            </div>
            <div className="border-l-2 pl-5">
              <h2 className="text-sm font-bold mb-1">Total Amount</h2>
              <p className="text-2xl font-bold mb-3">
                ₹ {activityData.total_amount.toString().slice(0, 8)}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <h2 className="text-sm font-bold mb-1">Status: </h2>
            <p
              className={`text-sm ${
                activityData.status === "accepted"
                  ? "text-green-600"
                  : activityData.status === "pending"
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {activityData.status}
            </p>
          </div>

          {activityData.note && (
            <div className="flex gap-2">
              <h2 className="text-sm font-bold mb-1">Note: </h2>
              <p className="text-sm">{activityData.note}</p>
            </div>
          )}

          {activityData.status === "pending" && isOwed && (
            <div className="flex [&_button]:grow gap-3 border-t border-dashed pt-5 mt-5">
              <Button
                variant="outline"
                onClick={() => {
                  handleStatusUpdate(activityData.id, "rejected");
                }}
              >
                <XIcon />
                Reject
              </Button>
              <Button
                onClick={() => {
                  handleStatusUpdate(activityData.id, "accepted");
                }}
              >
                <CheckIcon />
                Accept
              </Button>
            </div>
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
            <Avatar className="size-12 border">
              <AvatarImage
                src={toUser.profile_pic}
                alt={toUser.username}
                className="object-cover"
              />
              <AvatarFallback>
                {getInitials(toUser.full_name, "F")}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex text-sm font-normal gap-2 pt-3 pb-5">
            <button
              onClick={() =>
                navigate(`/activity/${activityData.other_user.id}`, {
                  replace: true,
                })
              }
              className="border text-xs font-normal px-3 py-2 rounded-md cursor-pointer hover:bg-muted transition"
            >
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
            <Avatar className="size-12 border">
              <AvatarImage
                src={fromUser.profile_pic}
                alt={fromUser.username}
                className="object-cover"
              />
              <AvatarFallback>
                {getInitials(fromUser.full_name, "F")}
              </AvatarFallback>
            </Avatar>
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
                className="w-full h-60 object-cover rounded-lg cursor-pointer"
                src={activityData.attachment}
                alt="Receipt"
                loading="lazy"
                onClick={() => setShowImageDialog(true)}
              />
            </CustomCard>
            <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
              <DialogContent
                showCloseButton={false}
                className="w-full max-w-3xl p-4 h-svh bg-zinc-200 dark:bg-zinc-800 border-none shadow-none rounded-none flex flex-col items-center justify-center"
              >
                <CustomCard radius={19} pClassName="flex-1 p-0 w-full">
                  <div className="h-[calc(100svh-5.7rem)] overflow-auto grid place-items-center">
                    <img
                      src={activityData.attachment}
                      className="w-full"
                      alt="Full Receipt"
                    />
                  </div>
                </CustomCard>

                <DialogClose asChild>
                  <Button
                    type="button"
                    aria-label="Close dialog"
                    className="w-full h-[2.7rem]"
                  >
                    Close <XIcon className="size-5" />
                  </Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
          </CustomCard>
        )}
      </div>
    </PageLayout>
  );
};

export default ActivityDetail;

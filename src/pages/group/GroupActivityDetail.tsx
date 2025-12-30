import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useParams } from "react-router";
import axiosInstance from "@/lib/axiosInstance";
import CustomCard from "@/components/CustomCard";
import PageLayout from "@/components/PageLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { DialogClose } from "@radix-ui/react-dialog";
import { CheckCircle2Icon, ClockIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/helpers";
import { Badge } from "@/components/ui/badge";

type Split = {
  activity_id: string | null;
  user_id: string;
  username: string;
  full_name: string;
  profile_pic: string | null;
  amount: number;
  status: "paid" | "pending";
};

type GroupActivityDetail = {
  id: string;
  group_id: string;
  group_name: string;
  current_user_id: string;
  paid_by: string;
  paid_by_name: string;
  total_amount: number;
  note: string;
  attachment: string | null;
  split_type: string;
  member_count: number;
  splits: Split[];
  created_at: string;
};

const GroupActivityDetail = () => {
  const { groupId, groupActivityId } = useParams<{
    groupId: string;
    groupActivityId: string;
  }>();
  const [activityData, setActivityData] = useState<GroupActivityDetail | null>(
    null
  );
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const fetchActivityData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axiosInstance.get<GroupActivityDetail>(
        `/groups/${groupId}/activities/${groupActivityId}`
      );

      setActivityData(res.data);
    } catch (err: any) {
      console.error("Error fetching group activity data:", err);
      setError(
        err?.response?.data?.message || "Failed to load activity details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId && groupActivityId) fetchActivityData();
  }, [groupId, groupActivityId]);

  if (loading) {
    return (
      <PageLayout title="Group Activity" isNav={false}>
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

          {/* Splits Skeleton */}
          <div className="p-5 space-y-4 bg-card border rounded-2xl">
            <Skeleton className="h-5 w-32 mb-2" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Group Activity" isNav={false}>
        <div className="text-center text-red-500 font-medium py-10">
          {error}
        </div>
      </PageLayout>
    );
  }

  if (!activityData) {
    return (
      <PageLayout title="Group Activity" isNav={false}>
        <div className="text-center text-gray-500 py-10">No data found.</div>
      </PageLayout>
    );
  }

  const paidByUser = activityData.splits.find(
    (s) => s.user_id === activityData.paid_by
  );

  return (
    <PageLayout title="Group Activity" isNav={false}>
      <div className="space-y-5">
        {/* Amount & Paid By Details */}
        <CustomCard radius={19} pClassName="relative" className="p-5">
          <div className="grid grid-cols-2 mb-4">
            <div>
              <h2 className="text-sm font-bold mb-1">Total Amount</h2>
              <p className="text-2xl font-bold">
                ₹ {activityData.total_amount.toLocaleString()}
              </p>
            </div>
            <div className="border-l-2 pl-5">
              <h2 className="text-sm font-bold mb-1">Split Type</h2>
              <p className="text-lg font-semibold capitalize">
                {activityData.split_type}
              </p>
            </div>
          </div>

          <div className="border-t border-dashed pt-4 mt-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs text-muted-foreground mb-1">Paid by</h2>
                <p className="text-md font-bold">{activityData.paid_by_name}</p>
              </div>
              {paidByUser && (
                <Avatar className="size-10 border">
                  <AvatarImage
                    src={paidByUser.profile_pic || undefined}
                    alt={paidByUser.username}
                    className="object-cover"
                  />
                  <AvatarFallback>
                    {getInitials(paidByUser.full_name, "U")}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>

          {activityData.note && (
            <div className="flex gap-2 mt-4 pt-4 border-t border-dashed">
              <h2 className="text-sm font-bold">Note:</h2>
              <p className="text-sm">{activityData.note}</p>
            </div>
          )}
        </CustomCard>

        {/* Splits List */}
        <CustomCard radius={19} className="p-5">
          <h2 className="text-sm font-bold mb-4">
            Split Details ({activityData.member_count} members)
          </h2>

          <div className="space-y-4">
            {activityData.splits.map((split) => {
              const isCurrentUser =
                split.user_id === activityData.current_user_id;
              const isPayer = split.user_id === activityData.paid_by;

              return (
                <div
                  key={split.user_id}
                  className="flex items-center justify-between py-2 border-b border-dashed last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 border">
                      <AvatarImage
                        src={split.profile_pic || undefined}
                        alt={split.username}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        {getInitials(split.full_name, "U")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold flex items-center gap-2">
                        {split.full_name}
                        {isCurrentUser && (
                          <span className="text-xs text-muted-foreground">
                            (You)
                          </span>
                        )}
                        {isPayer && (
                          <Badge variant="secondary" className="text-[10px]">
                            Paid
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{split.username}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="text-sm font-bold">
                      ₹ {split.amount.toLocaleString()}
                    </p>
                    {split.status === "paid" ? (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle2Icon className="size-3" />
                        Paid
                      </span>
                    ) : (
                      <span className="text-xs text-yellow-600 flex items-center gap-1">
                        <ClockIcon className="size-3" />
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 mt-4 border-t text-xs text-muted-foreground">
            <p>Group: {activityData.group_name}</p>
            <p>Date: {new Date(activityData.created_at).toLocaleString()}</p>
            <p>Ref: {activityData.id}</p>
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

export default GroupActivityDetail;

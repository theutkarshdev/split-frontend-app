import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate, useParams } from "react-router";
import axiosInstance from "@/lib/axiosInstance";
import CustomCard from "@/components/CustomCard";
import PageLayout from "@/components/PageLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { DialogClose } from "@radix-ui/react-dialog";
import { Check, X, ArrowRight, Receipt, Calendar, Hash, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import AvtarImg from "@/assets/Profile_avatar_placeholder_large.png";

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
        <div className="p-4 space-y-4">
          <CustomCard radius={20} className="p-5 space-y-4">
            <Skeleton className="h-8 w-32 mx-auto rounded-lg" />
            <Skeleton className="h-4 w-48 mx-auto rounded" />
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
            </div>
          </CustomCard>
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Activity Details" isNav={false}>
        <div className="p-6 text-center space-y-3">
          <p className="text-sm font-medium text-rose-500">{error}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(-1)}
            className="rounded-xl"
          >
            Go Back
          </Button>
        </div>
      </PageLayout>
    );
  }

  if (!activityData) {
    return (
      <PageLayout title="Activity Details" isNav={false}>
        <div className="p-6 text-center text-muted-foreground text-sm">
          No activity details found.
        </div>
      </PageLayout>
    );
  }

  const isPaid = activityData.type === "paid";
  const isOwed = activityData.type === "owed";
  const fromUser = isPaid ? activityData.current_user : activityData.other_user;
  const toUser = isPaid ? activityData.other_user : activityData.current_user;

  return (
    <PageLayout
      title="Activity Details"
      isNav={false}
      className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6"
    >
      {/* Luxury Receipt Card */}
      <CustomCard radius={24} className="p-6 border border-border/80 shadow-md relative overflow-hidden">
        {/* Top Receipt Notch / Indicator */}
        <div className="flex items-center justify-between pb-4 border-b border-dashed border-border">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-primary/10 grid place-content-center text-primary">
              <Receipt className="size-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Transaction Receipt
              </span>
              <p className="text-xs font-semibold text-foreground">
                {isPaid ? "Payment logged" : "Expense shared"}
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${
              activityData.status === "accepted"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : activityData.status === "pending"
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                : "bg-rose-500/15 text-rose-500"
            }`}
          >
            {activityData.status}
          </span>
        </div>

        {/* Amount Hero */}
        <div className="py-6 text-center">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {isPaid ? "You Paid" : "You Owe"}
          </span>
          <h2
            className={`text-3xl font-extrabold tracking-tight mt-1 ${
              isPaid
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            ₹{activityData.amount.toLocaleString()}
          </h2>
          {activityData.note && (
            <p className="text-xs text-foreground/85 font-medium mt-2 max-w-xs mx-auto">
              "{activityData.note}"
            </p>
          )}
        </div>

        {/* Bill Breakdown Grid */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-muted/30 border border-border/60">
          <div>
            <span className="text-[10px] uppercase font-semibold text-muted-foreground">
              Total Expense
            </span>
            <p className="text-sm font-bold text-foreground mt-0.5">
              ₹{activityData.total_amount.toLocaleString()}
            </p>
          </div>
          <div className="border-l border-border/60 pl-3">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground">
              Their Share
            </span>
            <p className="text-sm font-bold text-foreground mt-0.5">
              ₹{(activityData.total_amount - activityData.amount).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Pending Approval Action Buttons */}
        {activityData.status === "pending" && isOwed && (
          <div className="flex gap-2 pt-4 mt-4 border-t border-dashed border-border">
            <Button
              variant="outline"
              className="flex-1 rounded-xl h-10 text-xs font-semibold text-rose-500 border-rose-500/30 hover:bg-rose-500/10 cursor-pointer"
              onClick={() => handleStatusUpdate(activityData.id, "rejected")}
            >
              <X className="size-4 mr-1" /> Reject
            </Button>
            <Button
              className="flex-1 rounded-xl h-10 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs"
              onClick={() => handleStatusUpdate(activityData.id, "accepted")}
            >
              <Check className="size-4 mr-1" /> Accept
            </Button>
          </div>
        )}
      </CustomCard>

      {/* Participants Card */}
      <CustomCard radius={20} className="p-4 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Participants
        </h3>

        {/* Payer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              className="size-10 rounded-full object-cover border border-border"
              src={fromUser.profile_pic || AvtarImg}
              alt={fromUser.username}
            />
            <div>
              <p className="text-xs font-bold text-foreground">
                {fromUser.full_name || fromUser.username}
              </p>
              <span className="text-[11px] text-muted-foreground">
                Paid total amount
              </span>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Paid
          </span>
        </div>

        <div className="flex items-center justify-center my-1">
          <div className="h-px bg-border/60 grow" />
          <ArrowRight className="size-3 text-muted-foreground mx-2" />
          <div className="h-px bg-border/60 grow" />
        </div>

        {/* Payee */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              className="size-10 rounded-full object-cover border border-border"
              src={toUser.profile_pic || AvtarImg}
              alt={toUser.username}
            />
            <div>
              <p className="text-xs font-bold text-foreground">
                {toUser.full_name || toUser.username}
              </p>
              <span className="text-[11px] text-muted-foreground">
                Share to settle
              </span>
            </div>
          </div>
          <span className="text-xs font-semibold text-rose-500">
            Owes
          </span>
        </div>

        {/* View history shortcut */}
        <Button
          variant="outline"
          onClick={() =>
            navigate(`/activity/${activityData.other_user.id}`, {
              replace: true,
            })
          }
          className="w-full rounded-xl text-sm font-semibold h-11 px-5 border-border/80 cursor-pointer mt-2"
        >
          View Full Chat History
        </Button>
      </CustomCard>

      {/* Receipt Image Attachment */}
      {activityData.attachment && (
        <CustomCard radius={20} className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Receipt Attachment
            </h3>
          </div>

          <div
            onClick={() => setShowImageDialog(true)}
            className="rounded-xl overflow-hidden border border-border/80 cursor-pointer group relative"
          >
            <img
              className="w-full h-48 object-cover group-hover:scale-102 transition-transform duration-200"
              src={activityData.attachment}
              alt="Receipt"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
              Tap to view full receipt
            </div>
          </div>

          <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
            <DialogContent className="max-w-md p-3 bg-card border rounded-2xl">
              <img
                src={activityData.attachment}
                className="w-full max-h-[70vh] object-contain rounded-xl"
                alt="Full Receipt"
              />
              <DialogClose asChild>
                <Button className="w-full mt-2 rounded-xl text-sm font-semibold h-11">
                  Close Receipt
                </Button>
              </DialogClose>
            </DialogContent>
          </Dialog>
        </CustomCard>
      )}

      {/* Meta Information */}
      <CustomCard radius={16} className="p-3 text-[11px] text-muted-foreground space-y-1 bg-muted/20">
        <div className="flex items-center gap-1.5">
          <Calendar className="size-3" />
          <span>Logged on {new Date(activityData.created_at).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Hash className="size-3" />
          <span className="truncate">Ref: {activityData.id}</span>
        </div>
      </CustomCard>
    </PageLayout>
  );
};

export default ActivityDetail;

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import axiosInstance from "@/lib/axiosInstance";
import {
  Check,
  Clock,
  Loader2,
  UserCheck,
  UserPlus,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import AvtarImg from "@/assets/Profile_avatar_placeholder_large.png";
import type { AxiosError } from "axios";
import CustomCard from "@/components/CustomCard";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";

interface FriendRequest {
  id: string;
  username: string;
  full_name: string;
  profile_pic: string;
  email: string;
  status: string;
  type: string;
}

const InvitationManager: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [loadingRequests, setLoadingRequests] = useState<
    Record<string, boolean>
  >({});

  const currentTab = (tabParam || "received").toLowerCase();

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get(
          `/friends/requests?filter=${currentTab}&status=pending`
        );
        setRequests(res.data);
      } catch (err: unknown) {
        const error = err as AxiosError;
        setError(error.message || "Error fetching requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [currentTab]);

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab }, { replace: true });
  };

  const handleAction = async (
    request_id: string,
    action: "accept" | "reject"
  ) => {
    setLoadingRequests((prev) => ({ ...prev, [request_id]: true }));
    try {
      await axiosInstance.post("/friends/handle", {
        request_id,
        action,
      });
      setRequests((prev) => prev.filter((r) => r.id !== request_id));
      toast.success(
        action === "accept"
          ? "Friend request accepted!"
          : "Friend request declined."
      );
    } catch (err: unknown) {
      const error = err as AxiosError;
      console.error(error);
      toast.error("Action failed: " + (error.message || "unknown error"));
    } finally {
      setLoadingRequests((prev) => {
        const newState = { ...prev };
        delete newState[request_id];
        return newState;
      });
    }
  };

  return (
    <PageLayout
      title="Invitations"
      className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6"
    >
      {/* Segmented Filter Pills */}
      <div className="flex p-1.5 bg-muted/60 rounded-xl">
        <button
          type="button"
          onClick={() => handleTabChange("received")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            currentTab === "received"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Received
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("sent")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            currentTab === "sent"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sent
        </button>
      </div>

      <div>
        {loading && (
          <div className="space-y-2">
            {[...Array(5)].map((_, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card"
              >
                <Skeleton className="size-10 rounded-full" />
                <div className="space-y-1.5 grow">
                  <Skeleton className="h-3.5 w-28 rounded" />
                  <Skeleton className="h-2.5 w-20 rounded" />
                </div>
                <Skeleton className="h-9 w-20 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-xs text-rose-500 text-center py-2">{error}</p>}

        {!loading && !error && (
          <>
            {requests.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <div className="size-12 rounded-full bg-muted/60 grid place-content-center mx-auto text-muted-foreground">
                  {currentTab === "received" ? (
                    <UserCheck className="size-6" />
                  ) : (
                    <UserPlus className="size-6" />
                  )}
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  {currentTab === "received"
                    ? "No pending requests"
                    : "No sent requests"}
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  {currentTab === "received"
                    ? "You're all caught up! New friend requests will appear here."
                    : "Requests you send to other users will show up here until they respond."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {requests.map((req) => (
                  <CustomCard
                    radius={16}
                    key={req.id}
                    className="flex items-center justify-between p-3.5 border border-border/80 shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <img
                        className="size-10 object-cover rounded-full border border-border/60 shrink-0"
                        src={req.profile_pic || AvtarImg}
                        alt={req.username}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = AvtarImg;
                        }}
                      />
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-foreground truncate">
                          {req.full_name || req.username}
                        </h3>
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          @{req.username}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {currentTab === "received" ? (
                        loadingRequests[req.id] ? (
                          <Loader2 className="animate-spin size-4 text-primary" />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction(req.id, "reject")}
                              className="h-9 px-3 text-xs font-semibold text-rose-500 border-rose-500/30 hover:bg-rose-500/10 rounded-xl cursor-pointer"
                            >
                              <X className="size-3.5 mr-1" /> Decline
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleAction(req.id, "accept")}
                              className="h-9 px-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer shadow-xs"
                            >
                              <Check className="size-3.5 mr-1" /> Accept
                            </Button>
                          </div>
                        )
                      ) : (
                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                          <Clock className="size-3.5" /> Pending
                        </span>
                      )}
                    </div>
                  </CustomCard>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default InvitationManager;

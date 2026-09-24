import { useEffect, useState, useCallback, useMemo } from "react";
import AvtarImg from "@/assets/Profile_avatar_placeholder_large.png";
import {
  CheckCircle2,
  Clock,
  Search,
  X,
  XCircle,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { Input } from "@/components/ui/input";
import PageLayout from "@/components/PageLayout";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router";

interface OtherUser {
  id: string;
  full_name: string | null;
  username: string | null;
  profile_pic: string | null;
}

interface Activity {
  id: string;
  type: "paid" | "owed";
  amount: number;
  total_amount: number;
  note: string | null;
  attachment: string | null;
  status: "accepted" | "rejected" | string;
  created_at: string;
  updated_at: string;
  other_user: OtherUser | null;
}

interface ActivitiesResponse {
  data: Activity[];
  pagination: {
    limit: number;
    page: number;
    totalItems: number;
  };
}

const ActivityHistory: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const navigate = useNavigate();

  const fetchHistory = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get<ActivitiesResponse>(
        `/activities/my-history?limit=20&page=${pageNum}`
      );

      const newData = res.data?.data || [];
      if (pageNum === 1) {
        setActivities(newData);
      } else {
        setActivities((prev) => [...prev, ...newData]);
      }

      const totalItems = res.data?.pagination?.totalItems || 0;
      const limit = res.data?.pagination?.limit || 20;
      const totalPages = Math.ceil(totalItems / limit);
      setHasNextPage(pageNum < totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

  const loadMore = () => {
    if (hasNextPage && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchHistory(nextPage);
    }
  };

  const [sentryRef] = useInfiniteScroll({
    loading,
    hasNextPage,
    onLoadMore: loadMore,
    disabled: false,
    rootMargin: "0px 0px 400px 0px",
  });

  const filteredActivities = useMemo(() => {
    if (!searchQuery.trim()) return activities;
    const q = searchQuery.toLowerCase();
    return activities.filter((item) => {
      const noteMatch = item.note?.toLowerCase().includes(q);
      const nameMatch = item.other_user?.full_name?.toLowerCase().includes(q);
      const usernameMatch = item.other_user?.username?.toLowerCase().includes(q);
      return noteMatch || nameMatch || usernameMatch;
    });
  }, [activities, searchQuery]);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
            <CheckCircle2 className="size-2.5" /> Settled
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-full">
            <XCircle className="size-2.5" /> Rejected
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
            <Clock className="size-2.5" /> Pending
          </span>
        );
    }
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <PageLayout
      title="Expense History"
      className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6"
    >
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Filter history by friend or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-9 h-12 text-sm font-medium rounded-xl border-border/80 bg-card shadow-xs focus-visible:ring-primary"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {loading && activities.length === 0 ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card"
            >
              <Skeleton className="size-10 rounded-full" />
              <div className="space-y-1.5 grow">
                <Skeleton className="h-3.5 w-28 rounded" />
                <Skeleton className="h-2.5 w-20 rounded" />
              </div>
              <Skeleton className="h-4 w-14 rounded" />
            </div>
          ))}
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <div className="size-12 rounded-full bg-muted/60 grid place-content-center mx-auto text-muted-foreground">
            <Receipt className="size-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            No activities found
          </h3>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            {searchQuery
              ? "Try adjusting your search keyword."
              : "No expense activities recorded yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredActivities.map((activity) => {
            const username =
              activity.other_user?.username ?? "Unknown";
            const fullName =
              activity.other_user?.full_name ?? username;
            const profilePic =
              activity.other_user?.profile_pic ?? AvtarImg;
            const isPaid = activity.type === "paid";

            return (
              <div
                key={activity.id}
                onClick={() =>
                  activity.other_user &&
                  navigate(
                    `/activity/${activity?.other_user?.id}/${activity.id}`
                  )
                }
                className="flex items-center gap-3 p-3.5 rounded-xl border border-border/70 dark:border-white/[0.06] bg-card hover:bg-muted/40 transition-all cursor-pointer active:scale-99 shadow-xs"
              >
                <div className="relative shrink-0">
                  <img
                    className="size-10 object-cover rounded-full border border-border/60"
                    src={profilePic}
                    alt={fullName}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = AvtarImg;
                    }}
                  />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 size-4 rounded-full flex items-center justify-center text-[10px] text-white ring-2 ring-card ${
                      isPaid ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                  >
                    {isPaid ? (
                      <ArrowDownLeft className="size-2.5" />
                    ) : (
                      <ArrowUpRight className="size-2.5" />
                    )}
                  </span>
                </div>

                <div className="grow min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-semibold text-foreground truncate">
                      {fullName}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {activity.note || (isPaid ? "Payment made" : "Amount owed")}
                  </p>
                  <span className="text-xs text-muted-foreground/75">
                    {formatDateTime(activity.created_at)}
                  </span>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  <span
                    className={`text-sm font-bold tabular-nums ${
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
            );
          })}

          {hasNextPage && (
            <div ref={sentryRef} className="py-4 text-center text-xs text-muted-foreground">
              Loading more history...
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
};

export default ActivityHistory;

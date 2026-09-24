import { useNavigate, useParams } from "react-router";
import AvtarImg from "@/assets/Profile_avatar_placeholder_large.png";
import { Button } from "@/components/ui/button";
import { Check, X, Clock, Receipt, Image as ImageIcon, ShieldCheck, ArrowRight } from "lucide-react";
import AddActivityForm from "@/components/AddActivity";
import {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useLayoutEffect,
  useRef,
} from "react";
import axiosInstance from "@/lib/axiosInstance";
import toast from "react-hot-toast";
import PageLayout from "@/components/PageLayout";
import useInfiniteScroll from "react-infinite-scroll-hook";
import CustomCard from "@/components/CustomCard";
import { Skeleton } from "@/components/ui/skeleton";

interface Activity {
  id: string;
  type: "paid" | "owed";
  amount: number;
  total_amount: number;
  created_at: string;
  status: "accepted" | "pending" | "rejected";
  note?: string;
  attachment?: string;
  to_user_id: string;
}

interface UserInfo {
  id: string;
  username?: string;
  full_name?: string;
  profile_pic?: string;
}

interface Pagination {
  limit: number;
  page: number;
  totalItems: number;
}

interface ActivitiesData {
  data: Activity[];
  finalAmount: number;
  type: "owed" | "paid";
  user_info: UserInfo;
  pagination: Pagination;
}

interface ActivityCardProps extends Activity {
  current_user_id: string;
  onStatusUpdate: (id: string, status: "accepted" | "rejected") => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  id,
  type,
  amount,
  total_amount,
  created_at,
  status,
  note,
  attachment,
  onStatusUpdate,
}) => {
  const isOwed = type === "owed";
  const navigate = useNavigate();

  const formattedTime = new Date(created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      onClick={() => navigate(id)}
      className={`max-w-[85%] sm:max-w-sm mb-3.5 cursor-pointer group transition-transform active:scale-99 ${
        isOwed ? "mr-auto" : "ml-auto"
      }`}
    >
      <CustomCard
        radius={18}
        className={`p-3.5 sm:p-4 border transition-all duration-200 ${
          isOwed
            ? "bg-card border-border/80 shadow-xs hover:border-border hover:shadow-sm"
            : "bg-primary/5 dark:bg-primary/10 border-primary/25 shadow-xs hover:border-primary/40 hover:shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1">
            <span
              className={`text-lg sm:text-xl font-extrabold tracking-tight ${
                isOwed
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              ₹{amount.toLocaleString()}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">
              / ₹{total_amount.toLocaleString()}
            </span>
          </div>

          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              status === "accepted"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : status === "pending"
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                : "bg-rose-500/15 text-rose-500"
            }`}
          >
            {status === "pending" && <Clock className="size-2.5" />}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>

        {note && (
          <p className="text-xs text-foreground/90 font-medium my-2 bg-muted/30 px-2.5 py-1.5 rounded-lg border border-border/40">
            {note}
          </p>
        )}

        {attachment && (
          <div className="relative mt-2 rounded-xl overflow-hidden border border-border/70 group/img">
            <img
              src={attachment}
              alt="attachment"
              className="w-full h-32 sm:h-40 object-cover transition-transform duration-200 group-hover/img:scale-105"
            />
            <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
              <ImageIcon className="size-2.5" /> Receipt
            </div>
          </div>
        )}

        {status === "pending" && isOwed && (
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/60">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-8 text-xs font-semibold rounded-lg border-rose-500/30 text-rose-500 hover:bg-rose-500/10 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onStatusUpdate(id, "rejected");
              }}
            >
              <X className="size-3.5 mr-1" /> Reject
            </Button>
            <Button
              size="sm"
              className="flex-1 h-8 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs"
              onClick={(e) => {
                e.stopPropagation();
                onStatusUpdate(id, "accepted");
              }}
            >
              <Check className="size-3.5 mr-1" /> Accept
            </Button>
          </div>
        )}

        <div className="text-[10px] text-muted-foreground/75 mt-2 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Receipt className="size-3" />
            {isOwed ? "You owe" : "You paid"}
          </span>
          <span>{formattedTime}</span>
        </div>
      </CustomCard>
    </div>
  );
};

const UserActivity = () => {
  const { id } = useParams();
  const fix_limit = 20;
  const [activitiesData, setActivitiesData] = useState<ActivitiesData>({
    data: [],
    finalAmount: 0,
    type: "owed",
    user_info: { id: "" },
    pagination: {
      limit: fix_limit,
      page: 1,
      totalItems: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const navigate = useNavigate();

  const fetchUserActivities = useCallback(async (pageNum: number) => {
    try {
      const res = await axiosInstance.get<ActivitiesData>(
        `/activities/between/${id}?limit=${fix_limit}&page=${pageNum}`
      );

      const newData = res.data;

      setActivitiesData((prev) => {
        if (pageNum === 1) {
          return newData;
        } else {
          return {
            ...newData,
            data: [...prev.data, ...newData.data],
          };
        }
      });

      const totalItems = res.data?.pagination?.totalItems || 0;
      const limit = res.data?.pagination?.limit || fix_limit;
      const totalPages = Math.ceil(totalItems / limit);
      setHasNextPage(pageNum < totalPages);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch activities");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUserActivities(1);
  }, [id, fetchUserActivities]);

  const handleStatusUpdate = async (
    activity_id: string,
    status: "accepted" | "rejected"
  ) => {
    try {
      setActivitiesData((prev) => ({
        ...prev,
        data: prev.data.map((a) =>
          a.id === activity_id ? { ...a, status } : a
        ),
      }));
      await axiosInstance.patch(`/activities/${activity_id}/status`, {
        status,
      });
      toast.success(`Activity ${status}`);
      fetchUserActivities(1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const groupedByDate = useMemo(() => {
    const grouped = activitiesData.data.reduce<Record<string, Activity[]>>(
      (acc, txn) => {
        const dateKey = new Date(txn.created_at).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(txn);
        return acc;
      },
      {}
    );

    Object.keys(grouped).forEach((date) => {
      grouped[date].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });

    return grouped;
  }, [activitiesData.data]);

  const sortedDates = useMemo(
    () =>
      Object.keys(groupedByDate).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
      ),
    [groupedByDate]
  );

  const user = activitiesData.user_info;

  const loadMore = () => {
    if (hasNextPage && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchUserActivities(nextPage);
    }
  };

  const [infiniteRef, { rootRef }] = useInfiniteScroll({
    loading,
    hasNextPage,
    onLoadMore: loadMore,
    disabled: false,
  });

  const scrollableRootRef = useRef<React.ComponentRef<"div"> | null>(null);
  const lastScrollDistanceToBottomRef = useRef<number>(0);

  useLayoutEffect(() => {
    const scrollableRoot = scrollableRootRef.current;
    const lastScrollDistanceToBottom = lastScrollDistanceToBottomRef.current;
    if (scrollableRoot) {
      scrollableRoot.scrollTop =
        scrollableRoot.scrollHeight - lastScrollDistanceToBottom;
    }
  }, [activitiesData, rootRef]);

  const rootRefSetter = useCallback(
    (node: HTMLDivElement) => {
      rootRef(node);
      scrollableRootRef.current = node;
    },
    [rootRef]
  );

  const handleRootScroll = useCallback(() => {
    const rootNode = scrollableRootRef.current;
    if (rootNode) {
      const scrollDistanceToBottom = rootNode.scrollHeight - rootNode.scrollTop;
      lastScrollDistanceToBottomRef.current = scrollDistanceToBottom;
    }
  }, []);

  const isOwed = activitiesData.type === "owed";

  return (
    <PageLayout
      title={
        loading ? (
          <div className="flex gap-2.5 items-center">
            <Skeleton className="size-9 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="w-28 h-3.5 rounded" />
              <Skeleton className="w-20 h-2.5 rounded" />
            </div>
          </div>
        ) : (
          <div className="flex gap-2.5 items-center">
            <div className="relative">
              <img
                className="size-9 object-cover rounded-full border border-border"
                src={user.profile_pic || AvtarImg}
                loading="lazy"
                alt="Profile"
              />
              <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
            </div>
            <div className="grow min-w-0">
              <h2 className="text-sm font-bold text-foreground truncate">
                {user.full_name || user.username || "Friend"}
              </h2>
              <p className="text-[11px] text-muted-foreground truncate">
                @{user.username || "user"}
              </p>
            </div>
          </div>
        )
      }
      className="flex flex-col overflow-hidden !p-0"
      isNav={false}
    >
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row w-full h-full overflow-hidden">
        {/* Main Chat/Ledger Column */}
        <div className="flex-1 min-h-0 flex flex-col w-full h-full overflow-hidden">
          {loading ? (
            <div className="flex-1 min-h-0 flex flex-col p-4 sm:p-6 space-y-4 max-w-3xl mx-auto w-full overflow-y-auto">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3/4 p-4 rounded-2xl border border-border/60 ${
                    i % 2 === 0 ? "mr-auto bg-card" : "ml-auto bg-primary/5"
                  }`}
                >
                  <Skeleton className="w-24 h-6 mb-2 rounded" />
                  <Skeleton className="w-full h-3 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Scrollable Message Feed */}
              <div
                ref={rootRefSetter}
                onScroll={handleRootScroll}
                className="flex-1 min-h-0 overflow-y-auto w-full p-4 sm:p-6"
              >
                <div className="w-full max-w-3xl mx-auto flex flex-col">
                  {sortedDates.length === 0 ? (
                    <div className="my-auto text-center py-16 space-y-3">
                      <div className="size-14 rounded-full bg-muted/60 grid place-content-center mx-auto text-muted-foreground">
                        <Receipt className="size-7" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground">
                        No activities yet
                      </h3>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                        Split your first bill or expense with{" "}
                        {user.full_name?.split(" ")[0] || "your friend"}.
                      </p>
                    </div>
                  ) : (
                    <div>
                      {hasNextPage && (
                        <div
                          ref={infiniteRef}
                          className="py-2 text-center text-xs text-muted-foreground"
                        >
                          Loading older activities...
                        </div>
                      )}
                      {sortedDates.map((date) => (
                        <div key={date}>
                          <div className="sticky top-2 z-10 my-4 text-center">
                            <span className="glass-subtle border border-border/60 text-muted-foreground text-[10px] font-bold tracking-wider uppercase px-3.5 py-1 rounded-full shadow-xs">
                              {date}
                            </span>
                          </div>

                          {groupedByDate[date].map((txn) => (
                            <ActivityCard
                              key={txn.id}
                              {...txn}
                              current_user_id={user.id}
                              onStatusUpdate={handleStatusUpdate}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Sticky Action Dock */}
              <div className="w-full shrink-0 border-t border-border/70 dark:border-white/10 bg-card/95 backdrop-blur-xl">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3 w-full">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                      {isOwed ? "You Owe" : "Owed to You"}
                    </span>
                    <span
                      className={`text-lg sm:text-xl font-extrabold tracking-tight ${
                        isOwed
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      ₹{activitiesData.finalAmount.toLocaleString()}
                    </span>
                  </div>

                  <AddActivityForm
                    to_user_id={id!}
                    onActivityAdded={fetchUserActivities}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Desktop Info Sidebar (Visible on lg and up) */}
        {!loading && (
          <aside className="hidden lg:flex w-80 h-full border-l border-border/70 dark:border-white/[0.08] bg-card/40 backdrop-blur-xl p-6 flex-col justify-between shrink-0">
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="text-center space-y-2">
                <div className="relative size-20 mx-auto">
                  <img
                    className="size-full object-cover rounded-full border-2 border-border shadow-md"
                    src={user.profile_pic || AvtarImg}
                    alt={user.username || "Friend"}
                  />
                  <span className="absolute bottom-0 right-0 size-4 rounded-full bg-emerald-500 ring-2 ring-card" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {user.full_name || user.username || "Friend"}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    @{user.username || "user"}
                  </p>
                </div>
              </div>

              {/* Mutual Balance Status Card */}
              <CustomCard radius={18} className="p-4 border border-border/80 shadow-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Mutual Settlement Balance
                </span>
                <p
                  className={`text-2xl font-extrabold tracking-tight ${
                    isOwed
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  ₹{activitiesData.finalAmount.toLocaleString()}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {isOwed
                    ? `You owe ${user.full_name?.split(" ")[0] || "them"} ₹${activitiesData.finalAmount}`
                    : `${user.full_name?.split(" ")[0] || "They"} owe you ₹${activitiesData.finalAmount}`}
                </p>
              </CustomCard>

              {/* Quick Actions */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Shortcuts
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/search?friend_filter=friends")}
                  className="w-full justify-between rounded-xl h-9 text-xs font-semibold border-border/80 hover:bg-muted cursor-pointer"
                >
                  <span>All Friends</span>
                  <ArrowRight className="size-3.5 text-muted-foreground" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/profile/history")}
                  className="w-full justify-between rounded-xl h-9 text-xs font-semibold border-border/80 hover:bg-muted cursor-pointer"
                >
                  <span>Activity History</span>
                  <ArrowRight className="size-3.5 text-muted-foreground" />
                </Button>
              </div>
            </div>

            {/* Footer verification note */}
            <div className="pt-4 border-t border-border/60 text-center">
              <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                <ShieldCheck className="size-3 text-primary" /> Verified Connection
              </span>
            </div>
          </aside>
        )}
      </div>
    </PageLayout>
  );
};

export default UserActivity;

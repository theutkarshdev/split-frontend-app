import { useParams } from "react-router";
import AvtarImg from "@/assets/Profile_avatar_placeholder_large.png";
import { Button } from "@/components/ui/button";
import { CheckIcon, XIcon } from "lucide-react";
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
import { Squircle } from "@squircle-js/react";
import PageLayout from "@/components/PageLayout";
import useInfiniteScroll from "react-infinite-scroll-hook";
import CustomCard from "@/components/CustomCard";

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
  to_user_id,
  current_user_id,
  onStatusUpdate,
}) => {
  const isOwed = type === "owed";

  const formattedTime = new Date(created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Squircle
      cornerRadius={20}
      cornerSmoothing={1}
      className={`max-w-4/5 md:max-w-72 w-full shadow-md mb-3 bg-input p-[1.5px]  ${
        isOwed ? "" : "ml-auto"
      }`}
    >
      <Squircle
        cornerRadius={19}
        cornerSmoothing={1}
        className={`p-3 border-b-4 border-b-primary ${
          isOwed ? "bg-card" : "bg-card/10 ml-auto"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">₹{amount.toLocaleString()}</span>
          <span
            className={`text-sm ${
              status === "accepted"
                ? "text-green-600"
                : status === "pending"
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>

        {note && <div className="text-sm my-1">{note}</div>}

        {attachment && (
          <CustomCard radius={12}>
            <img
              src={attachment}
              alt="attachment"
              className="w-full h-32 object-cover rounded"
            />
          </CustomCard>
        )}

        {status === "pending" && to_user_id !== current_user_id && (
          <div className="flex [&_button]:grow gap-3 my-3">
            <Button
              variant="outline"
              onClick={() => onStatusUpdate(id, "rejected")}
            >
              <XIcon />
              Reject
            </Button>
            <Button onClick={() => onStatusUpdate(id, "accepted")}>
              <CheckIcon />
              Accept
            </Button>
          </div>
        )}

        <div className="text-xs text-gray-500 mt-2 text-right">
          Total: ₹{total_amount.toLocaleString()} | {formattedTime}
        </div>
      </Squircle>
    </Squircle>
  );
};

const UserActivity = () => {
  const { id } = useParams();
  const fix_limit = 5;
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

  // ✅ Make fetch function reusable
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
            data: [...prev.data, ...newData.data], // append new data
          };
        }
      });

      // check if more pages exist
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
  }, []);

  useEffect(() => {
    fetchUserActivities(1);
  }, [id]);

  const handleStatusUpdate = async (
    activityId: string,
    status: "accepted" | "rejected"
  ) => {
    try {
      // Optimistic update
      setActivitiesData((prev) => ({
        ...prev,
        data: prev.data.map((a) =>
          a.id === activityId ? { ...a, status } : a
        ),
      }));
      await axiosInstance.patch(`/activities/${activityId}/status`, { status });
      toast.success(`Activity ${status}`);
      fetchUserActivities(1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const groupedByDate = useMemo(() => {
    // Group by date but also sort each date’s activities ascending
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

    // Sort each date's activities ascending by time
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });

    return grouped;
  }, [activitiesData.data]);

  // Sort dates ascending (oldest at top, newest at bottom)
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

  return (
    <PageLayout
      title={
        <div className="flex gap-2 items-center">
          <img
            className="w-10 h-10 aspect-square object-cover rounded-full"
            src={user.profile_pic || AvtarImg}
            loading="lazy"
            alt="Profile"
          />
          <div className="grow overflow-hidden">
            <h3 className="text-md font-medium truncate">
              {user.username || "john_doe"}
            </h3>
            <p className="text-xs capitalize opacity-65 truncate">
              {user.full_name || "John Doe"}
            </p>
          </div>
        </div>
      }
      className="flex flex-col !p-0"
      isNav={false}
    >
      {loading ? (
        "Loading..."
      ) : (
        <>
          <div
            ref={rootRefSetter}
            onScroll={handleRootScroll}
            className="p-5 grow flex flex-col overflow-auto"
          >
            {sortedDates.length === 0 ? (
              <p className="text-center text-gray-500 mt-5">
                No activities found
              </p>
            ) : (
              <div>
                {hasNextPage && (
                  <div
                    ref={infiniteRef}
                    className="py-4 text-center text-gray-400"
                  >
                    Loading more...
                  </div>
                )}
                {sortedDates.map((date) => (
                  <div key={date}>
                    <div className="sticky top-0 z-10 mb-2 text-center text-xs font-medium text-gray-500">
                      <span className="bg-gray-200 rounded-full px-3 py-1 inline-block">
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

          <div className="px-5 border-t py-5 w-full bg-card flex items-center">
            <p className="text-lg font-bold grow">
              You {activitiesData.type === "owed" ? "Owed" : "Paid"}:{" "}
              <span
                className={
                  activitiesData.type === "owed"
                    ? "text-red-500"
                    : "text-green-500"
                }
              >
                ₹{activitiesData.finalAmount.toLocaleString()}
              </span>
            </p>
            {/* ✅ Pass callback to AddActivityForm */}
            <AddActivityForm
              to_user_id={id!}
              onActivityAdded={fetchUserActivities}
            />
          </div>
        </>
      )}
    </PageLayout>
  );
};

export default UserActivity;

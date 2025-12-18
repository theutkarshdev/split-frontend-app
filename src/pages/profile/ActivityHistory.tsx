import { useEffect, useState, useCallback } from "react";
import CustomCard from "@/components/CustomCard";
import AvtarImg from "@/assets/Profile_avatar_placeholder_large.png";
import {
  CircleAlertIcon,
  IndianRupeeIcon,
  SearchIcon,
  SlidersVerticalIcon,
} from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { Input } from "@/components/ui/input";
import PageLayout from "@/components/PageLayout";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router";
import NoDataFound from "@/components/NoDataFound";
// types
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

      // check if more pages exist
      const totalItems = res.data?.pagination?.totalItems || 0;
      const limit = res.data?.pagination?.limit || 10;
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

  const getStatusText = (status: string) => {
    switch (status) {
      case "accepted":
        return "";
      case "rejected":
        return (
          <p className="text-xs flex items-center gap-1 text-red-400">
            Rejected <CircleAlertIcon className="size-3" />
          </p>
        );
      default:
        return (
          <p className="text-xs flex items-center gap-1 text-yellow-600">
            Pending <CircleAlertIcon className="size-3" />
          </p>
        );
    }
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date
      .toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(",", " |");
  };

  return (
    <PageLayout title={"My History"} className="space-y-4">
      {loading && activities.length === 0 ? (
        [...Array(7)].map((_, idx) => (
          <CustomCard
            key={idx}
            className="flex items-center border-b p-3 gap-2"
          >
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-2 grow">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2 w-32" />
              <Skeleton className="h-1 w-22" />
            </div>
            <Skeleton className="h-2 w-32" />
          </CustomCard>
        ))
      ) : (
        <>
          <div className="flex gap-2 items-center">
            <CustomCard
              radius={10}
              pClassName="group focus-within:bg-primary/50 transition-colors duration-200 grow h-12"
              className="h-full flex items-center w-full"
            >
              <div className="relative w-full">
                <Input
                  className="border-none font-medium outline-none !ring-0 h-12"
                  placeholder="search history here..."
                />
                <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-border" />
              </div>
            </CustomCard>

            <CustomCard
              radius={10}
              pClassName="size-12"
              className="size-full flex items-center justify-center w-full"
            >
              <SlidersVerticalIcon className="size-5" />
            </CustomCard>
          </div>

          {activities.length === 0 ? (
            <NoDataFound errorMsg={"No activities found."} />
          ) : (
            <div className="flex flex-col gap-2">
              {activities.map((activity) => {
                const username =
                  activity.other_user?.username ?? "Unknown User";
                const fullName = activity.other_user?.full_name ?? "No Name";
                const profilePic = activity.other_user?.profile_pic ?? AvtarImg;

                return (
                  <CustomCard
                    key={activity.id}
                    radius={15}
                    className="flex gap-2 items-center p-3"
                    onClick={() =>
                      activity.other_user &&
                      navigate(
                        `/activity/${activity?.other_user?.id}/${activity.id}`
                      )
                    }
                  >
                    <img
                      className="size-10 aspect-square object-cover rounded-full"
                      src={profilePic}
                      alt={fullName}
                      loading="lazy"
                    />
                    <div className="grow overflow-hidden">
                      <h3 className="text-md font-medium truncate">
                        {username}
                      </h3>
                      <p className="text-xs capitalize opacity-65 truncate">
                        {fullName}
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
                );
              })}

              {/* Infinite scroll loader sentinel */}
              {hasNextPage && (
                <div ref={sentryRef} className="py-4 text-center text-gray-400">
                  Loading more...
                </div>
              )}
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
};

export default ActivityHistory;

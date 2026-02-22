import { useEffect, useState, useCallback } from "react";
import CustomCard from "@/components/CustomCard";
import { SearchIcon, SlidersVerticalIcon } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { Input } from "@/components/ui/input";
import PageLayout from "@/components/PageLayout";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { Skeleton } from "@/components/ui/skeleton";
import NoDataFound from "@/components/NoDataFound";
import ActivityCard from "@/components/ActivityCard";
import type { ActivitiesResponse, Activity } from "@/types/activity";

const ActivityHistory: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);

  const fetchHistory = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get<ActivitiesResponse>(
        `/activities/my-history?limit=20&page=${pageNum}`,
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
              {activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}

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

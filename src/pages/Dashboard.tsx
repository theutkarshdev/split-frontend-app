import { BellIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import PageLayout from "@/components/PageLayout";
import CustomCard from "@/components/CustomCard";
import axiosInstance from "@/lib/axiosInstance";
import { useEffect, useState } from "react";
import type { Profile } from "@/types/auth";
import AvtarImg from "@/assets/Profile_avatar_placeholder_large.png";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const [notification, setNotification] = useState<number>(0);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchUnreadCount = async () => {
    try {
      const res = await axiosInstance("/notifications/unread-count");
      if (res.status === 200) {
        setNotification(res.data.unread_count || 0);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchFriends = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/friends/");
      if (Array.isArray(res.data)) {
        setProfiles(res.data);
      } else {
        setProfiles([]);
        setError("Unexpected response from server");
      }
    } catch (err: any) {
      console.error("Fetch friends error:", err);
      setError(
        err?.response?.data?.message ||
          "Could not load friends. Please try again."
      );
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    fetchFriends();
  }, []);

  return (
    <PageLayout className="p-0">
      <div className="h-[40vh] relative">
        <CustomCard
          radius={35}
          className="p-5 h-full"
          pClassName="absolute h-[calc(40vh+3rem)] w-full right-5 translate-x-5 -top-8 p-0"
        >
          <div className="flex gap-3 items-center mb-4 mt-8">
            <h1 className="text-xl font-semibold grow">
              Hello, Good Morning..!{" "}
            </h1>
            <Button
              size="icon"
              onClick={() => navigate("/notifications")}
              className="relative rounded-full !bg-card"
            >
              <BellIcon className="size-5 text-primary" />
              {notification > 0 && (
                <span className="size-2 bg-red-400 absolute top-2 right-2 rounded-full"></span>
              )}
            </Button>
          </div>
        </CustomCard>
      </div>

      <div className="p-5">
        <CustomCard className="p-5" pClassName="mt-5" radius={25}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">My Friends</h2>
            <Button
              variant="ghost"
              className="p-0 opacity-50 h-5"
              onClick={() => navigate("/search?friend_filter=friends")}
            >
              See All
            </Button>
          </div>

          <div className="mt-4">
            <div className="grid grid-cols-4 gap-2">
              {/* Add Button (common for both states) */}
              <div
                className="text-center cursor-pointer"
                onClick={() => navigate("/search?friend_filter=all")}
              >
                <CustomCard
                  radius={50}
                  className="w-full aspect-square grid place-content-center"
                >
                  <PlusIcon className="size-10 p-0 text-zinc-200 dark:text-zinc-700" />
                </CustomCard>
                <div className="overflow-hidden mt-2">
                  <h3 className="text-xs font-medium truncate">Add</h3>
                </div>
              </div>

              {/* Loading State */}
              {loading &&
                [...Array(7)].map((_, idx) => (
                  <div key={idx}>
                    <CustomCard radius={50} className="w-full aspect-square">
                      <Skeleton className="size-full" />
                    </CustomCard>
                    <Skeleton className="h-3 w-[90%] mt-2 mx-auto" />
                  </div>
                ))}

              {/* Loaded State */}
              {!loading &&
                !error &&
                profiles.map((item, idx) => (
                  <div
                    key={idx}
                    className="text-center cursor-pointer"
                    onClick={() => {
                      const status = item.friend_request_status;
                      if (status === undefined || status === "accepted") {
                        navigate(`/activity/${item.id}`);
                      }
                    }}
                  >
                    <CustomCard radius={50} className="w-full aspect-square">
                      <img
                        className="size-full aspect-square object-cover"
                        src={item.profile_pic || AvtarImg}
                        alt={item.username}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = AvtarImg;
                        }}
                      />
                    </CustomCard>
                    <div className="overflow-hidden mt-2">
                      <h3 className="text-xs font-medium">
                        {item.full_name.split(" ")[0]}
                      </h3>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </CustomCard>
      </div>
    </PageLayout>
  );
};

export default Dashboard;

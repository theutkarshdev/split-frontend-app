import { Input } from "@/components/ui/input";
import { BellIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import PageLayout from "@/components/PageLayout";
import CustomCard from "@/components/CustomCard";
import axiosInstance from "@/lib/axiosInstance";
import { useEffect, useState } from "react";
import type { Profile } from "@/types/auth";
import AvtarImg from "@/assets/Profile_avatar_placeholder_large.png";
import NoDataImg from "@/assets/no-data.png";
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
    <PageLayout>
      <div className="flex gap-3 items-center mb-4">
        <h1 className="text-xl font-semibold grow">Hello, Good Morning..! </h1>
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
      <div>
        <CustomCard radius={19} className="p-5 h-42">
          Squircle!
        </CustomCard>

        <CustomCard
          radius={10}
          pClassName="group focus-within:bg-primary/50 transition-colors duration-200 grow h-12 mt-5"
          className="h-full flex items-center w-full"
        >
          <div className="relative w-full h-full">
            <Input
              className="border-none font-medium outline-none !ring-0 h-12"
              placeholder="Search your friends here..."
              onClick={() => navigate("/search?friend_filter=friends")}
            />
            <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-border" />
          </div>
        </CustomCard>

        <div className="mt-4">
          <div className="grid grid-cols-3 gap-2">
            {loading &&
              [...Array(7)].map((_, idx) => (
                <CustomCard
                  key={idx}
                  radius={30}
                  className="w-full h-full aspect-square bg-card flex flex-col items-center justify-center"
                >
                  <Skeleton className="size-14 rounded-full" />
                  <Skeleton className="h-3 w-14 mt-2" />
                </CustomCard>
              ))}
          </div>

          {error && !loading && (
            <p className="text-sm text-red-500 p-2">{error}</p>
          )}

          {!loading && !error && profiles.length === 0 && (
            <div className="text-sm text-gray-500 p-5 pb-14 text-center bg-card">
              <img className="w-52 mx-auto" src={NoDataImg} />
              <h5 className="text-xl mb-1">No results found</h5>
              <p>Try different keywords or remove search filters</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            {!loading &&
              !error &&
              profiles.length > 0 &&
              profiles.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    const status = item.friend_request_status;
                    if (status === undefined || status === "accepted") {
                      navigate(`/activity/${item.id}`);
                    }
                  }}
                >
                  <CustomCard
                    radius={30}
                    className="w-full aspect-square bg-card grid place-content-center text-center p-3"
                  >
                    <img
                      className="w-10 sm:w-14 aspect-square object-cover rounded-full mx-auto border"
                      src={
                        item.profile_pic
                          ? item.profile_pic.startsWith(
                              "https://lh3.googleusercontent.com/"
                            )
                            ? item.profile_pic.replace(/=s\d+-c$/, "=s63-c")
                            : item.profile_pic
                          : AvtarImg
                      }
                      alt={item.username}
                      loading="lazy"
                      onError={(
                        e: React.SyntheticEvent<HTMLImageElement, Event>
                      ) => {
                        const target = e.currentTarget;
                        target.onerror = null; // Prevent infinite loop
                        target.src = AvtarImg;
                      }}
                    />

                    <div className="grow overflow-hidden mt-2">
                      <h3 className="text-xs font-medium truncate">
                        @{item.username}
                      </h3>
                    </div>
                  </CustomCard>
                </div>
              ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;

import { Input } from "@/components/ui/input";
import axiosInstance from "@/lib/axiosInstance";
import { Squircle } from "@squircle-js/react";
import {
  SearchIcon,
  SlidersVerticalIcon,
  UserPlus2Icon,
  ClockIcon,
  XCircleIcon,
  LoaderCircleIcon,
  SendIcon,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router";

interface Profile {
  id: string;
  username: string;
  email: string;
  full_name: string;
  profile_pic: string;
  friend_request_status: string | null;
}

const SearchProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const debounceRef = useRef<number | null>(null);

  const [searchParams] = useSearchParams();
  const friendFilter = searchParams.get("friend_filter");

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length > 3) {
      debounceRef.current = window.setTimeout(() => {
        fetchProfiles(query);
      }, 500);
    } else {
      setProfiles([]);
      setError(null);
      setLoading(false);
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const fetchProfiles = async (val: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(
        `/profile/search?query=${encodeURIComponent(
          val
        )}&friend_filter=${friendFilter}`
      );
      if (Array.isArray(res.data)) {
        setProfiles(res.data);
      } else {
        setProfiles([]);
        setError("Unexpected response from server");
      }
    } catch (err: any) {
      console.error("Search error:", err);
      setError(
        err?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (id: string) => {
    // ✅ Mark this user as loading
    setLoadingMap((prev) => ({ ...prev, [id]: true }));

    try {
      const res = await axiosInstance.post("/friends/add", {
        receiver_id: id,
      });

      if (res.status === 200) {
        toast.success(
          `Invitation sent to ${res.data.receiver_full_name.split(" ")[0]}`
        );

        // ✅ Update profile friend_request_status
        setProfiles((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, friend_request_status: "pending" } : p
          )
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not send friend request");
    } finally {
      // ✅ Remove loading state for this user
      setLoadingMap((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Rendering icons dynamically
  const renderStatusIcon = (item: Profile) => {
    if (loadingMap[item.id]) {
      return <LoaderCircleIcon className="animate-spin size-5 opacity-55" />;
    }

    switch (item.friend_request_status) {
      case null:
        return (
          <UserPlus2Icon
            onClick={() => sendFriendRequest(item.id)}
            className="size-5 cursor-pointer opacity-55"
          />
        );
      case "pending":
        return <ClockIcon className="size-5 cursor-pointer opacity-55" />;
      case "rejected":
        return <XCircleIcon className="size-5 cursor-pointer opacity-55" />;
      case "accepted":
        return <SendIcon className="size-5 cursor-pointer opacity-55" />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="border-b mb-5 pb-3">
        <h1 className="text-xl mb-1 font-semibold">
          Search {` ${friendFilter == "all" ? "anyone" : "friends"}`}
        </h1>
        <p className="text-xs">Type there username, email or name.</p>
      </div>
      <div className="flex gap-2 items-center">
        <Squircle
          cornerRadius={11}
          cornerSmoothing={1}
          className="group bg-border p-[1.5px] focus-within:bg-primary/50 transition-colors duration-200 grow h-[2.8rem]"
        >
          <Squircle
            cornerRadius={10}
            cornerSmoothing={1}
            className="bg-white h-full flex items-center w-full"
          >
            <div className="relative w-full">
              <Input
                className="border-none font-medium outline-none !ring-0"
                placeholder={`Search ${
                  friendFilter == "all" ? "anyone" : "friends"
                }`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-border" />
            </div>
          </Squircle>
        </Squircle>
        <Squircle
          cornerRadius={11}
          cornerSmoothing={1}
          className="group bg-border p-[1.5px] size-[2.8rem]"
        >
          <Squircle
            cornerRadius={10}
            cornerSmoothing={1}
            className="bg-white size-full flex items-center justify-center w-full"
          >
            <SlidersVerticalIcon className="size-5" />
          </Squircle>
        </Squircle>
      </div>

      {/* Results Section */}
      <div className="mt-3">
        {loading &&
          [...Array(7)].map((_, idx) => (
            <div
              key={idx}
              className="flex items-center mb-1 border-b p-2 gap-2"
            >
              <Skeleton className="size-10 rounded-full" />
              <div className="space-y-2 grow">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-2 w-32" />
              </div>
              <Skeleton className="size-5 rounded-full" />
            </div>
          ))}

        {error && !loading && (
          <p className="text-sm text-red-500 p-2">{error}</p>
        )}

        {!loading && !error && profiles.length === 0 && (
          <div className="text-sm text-gray-500 p-2">
            <img
              className="grayscale"
              src="https://marketbold.com/images/no-results-found-youtube-search.gif"
            />
          </div>
        )}

        {!loading &&
          !error &&
          profiles.length > 0 &&
          profiles.map((item, idx) => (
            <div
              key={idx}
              className="flex gap-2 border-b items-center p-2 hover:bg-gray-50 transition-colors"
            >
              <img
                className="size-10 aspect-square object-cover rounded-full"
                src={item.profile_pic}
                alt={item.username}
                loading="lazy"
              />
              <div className="grow overflow-hidden">
                <h3 className="text-sm font-medium truncate">
                  {item.username}
                </h3>
                <p className="text-xs capitalize opacity-65 truncate">
                  {item.full_name}
                </p>
              </div>
              {renderStatusIcon(item)}
            </div>
          ))}
      </div>
    </div>
  );
};

export default SearchProfiles;

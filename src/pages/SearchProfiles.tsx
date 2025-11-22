import { Input } from "@/components/ui/input";
import axiosInstance from "@/lib/axiosInstance";
import {
  SearchIcon,
  SlidersVerticalIcon,
  UserPlus2Icon,
  ClockIcon,
  XCircleIcon,
  LoaderCircleIcon,
  SendIcon,
  XIcon,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router";
import AvtarImg from "@/assets/Profile_avatar_placeholder_large.png";
import CustomCard from "@/components/CustomCard";
import PageLayout from "@/components/PageLayout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Profile } from "@/types/auth";
import NoDataFound from "@/components/NoDataFound";

const SearchProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const debounceRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const friendFilter = searchParams.get("friend_filter") || "all";

  useEffect(() => {
    if (friendFilter === "friends") {
      fetchFriends();
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length > 3) {
      debounceRef.current = window.setTimeout(() => {
        fetchProfiles(query);
      }, 500);
    } else {
      setProfiles([]);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, friendFilter]);

  // Fetch friends function
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
        (err &&
          typeof err === "object" &&
          "response" in err &&
          err.response?.data?.message) ||
          "Could not load friends. Please try again."
      );
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

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
    <PageLayout
      title={`Search ${friendFilter == "all" ? "Anyone" : "Friends"}`}
    >
      <div className="flex gap-2 items-center">
        <CustomCard
          radius={10}
          pClassName="group focus-within:bg-primary/50 transition-colors duration-200 grow h-12"
          className="h-full flex items-center w-full"
        >
          <div className="relative w-full">
            <Input
              ref={inputRef}
              className="border-none font-medium outline-none !ring-0 h-12"
              placeholder={`Search ${
                friendFilter == "all" ? "anyone" : "friends"
              } (Ex: Utkarsh)`}
              value={query}
              autoFocus
              onChange={(e) => setQuery(e.target.value)}
            />
            <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-border" />
          </div>
        </CustomCard>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div>
              <CustomCard
                radius={10}
                pClassName="size-12"
                className="size-full flex items-center justify-center w-full"
              >
                <SlidersVerticalIcon className="size-5" />
              </CustomCard>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-40 mt-2 border-none p-0 bg-transparent shadow-none"
            align="end"
          >
            <CustomCard radius={14} className="pb-2">
              <DropdownMenuLabel className="px-4 pt-3">
                Add Filters
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={friendFilter}
                onValueChange={(value) => {
                  setSearchParams({ friend_filter: value }, { replace: true });
                }}
              >
                <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="friends">
                  Friends
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="non-friends">
                  Non Friends
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </CustomCard>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {friendFilter && friendFilter !== "all" && (
        <div className="mt-3 text-sm">
          Filters:{" "}
          <Badge
            asChild
            onClick={() =>
              setSearchParams({ friend_filter: "all" }, { replace: true })
            }
          >
            <Button className="h-6">
              {friendFilter} <XIcon />
            </Button>
          </Badge>
        </div>
      )}

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

        {!loading && !error && profiles.length === 0 && <NoDataFound />}
        <div className="space-y-3">
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
                <CustomCard radius={14} className="flex gap-2 items-center p-2">
                  <img
                    className="size-10 aspect-square object-cover rounded-full"
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

                  <div className="grow overflow-hidden">
                    <h3 className="text-md font-medium truncate">
                      {item.username}
                    </h3>
                    <p className="text-xs capitalize opacity-65 truncate">
                      {item.full_name}
                    </p>
                  </div>
                  {renderStatusIcon(item)}
                </CustomCard>
              </div>
            ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default SearchProfiles;

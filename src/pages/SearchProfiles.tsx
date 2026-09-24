import { Input } from "@/components/ui/input";
import axiosInstance from "@/lib/axiosInstance";
import {
  Search,
  UserPlus,
  Clock,
  Loader2,
  X,
  Users,
  Check,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router";
import AvtarImg from "@/assets/Profile_avatar_placeholder_large.png";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/types/auth";

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

  const fetchFriends = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/friends");
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

  useEffect(() => {
    if (friendFilter === "friends" && !query.trim()) {
      fetchFriends();
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length >= 2) {
      debounceRef.current = window.setTimeout(() => {
        fetchProfiles(query);
      }, 350);
    } else if (friendFilter === "friends") {
      fetchFriends();
    } else {
      setProfiles([]);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, friendFilter]);

  const sendFriendRequest = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLoadingMap((prev) => ({ ...prev, [id]: true }));

    try {
      const res = await axiosInstance.post("/friends/add", {
        receiver_id: id,
      });

      if (res.status === 200) {
        toast.success(
          `Friend request sent to ${res.data.receiver_full_name?.split(" ")[0] || "user"}`
        );

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
      setLoadingMap((prev) => ({ ...prev, [id]: false }));
    }
  };

  const renderStatusAction = (item: Profile) => {
    if (loadingMap[item.id]) {
      return (
        <div className="size-8 rounded-lg bg-muted grid place-content-center shrink-0">
          <Loader2 className="animate-spin size-4 text-primary" />
        </div>
      );
    }

    switch (item.friend_request_status) {
      case null:
      case undefined:
        return (
          <Button
            size="sm"
            onClick={(e) => sendFriendRequest(item.id, e)}
            className="rounded-xl h-8 px-2.5 text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 shrink-0 cursor-pointer"
          >
            <UserPlus className="size-3.5 mr-1" /> Add
          </Button>
        );
      case "pending":
        return (
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0">
            <Clock className="size-3" /> Pending
          </span>
        );
      case "accepted":
        return (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/activity/${item.id}`)}
            className="rounded-xl h-8 px-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 shrink-0 cursor-pointer"
          >
            <Check className="size-3.5 mr-1" /> Split
          </Button>
        );
      case "rejected":
        return (
          <span className="text-[11px] font-medium text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-lg shrink-0">
            Declined
          </span>
        );
      default:
        return null;
    }
  };

  const filterTabs = [
    { id: "all", label: "All Users" },
    { id: "friends", label: "My Friends" },
  ];

  return (
    <PageLayout
      title={friendFilter === "all" ? "Find Friends" : "My Friends"}
      className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6"
    >
      {/* Search Input & Segmented Filter Bar */}
      <div className="space-y-4 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            className="pl-10 pr-9 h-11 text-xs sm:text-sm font-medium rounded-xl border-border/80 bg-card shadow-xs focus-visible:ring-primary"
            placeholder={
              friendFilter === "all"
                ? "Search by username or name..."
                : "Search in your friends..."
            }
            value={query}
            autoFocus
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Filter Segmented Control */}
        <div className="flex p-1 bg-muted/60 rounded-xl max-w-xs">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setSearchParams({ friend_filter: tab.id }, { replace: true })
              }
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                friendFilter === tab.id
                  ? "bg-card text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section: Responsive Grid on Laptop/Desktop */}
      <div>
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {[...Array(6)].map((_, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-border/60 bg-card"
              >
                <Skeleton className="size-11 rounded-full" />
                <div className="space-y-1.5 grow">
                  <Skeleton className="h-3.5 w-28 rounded" />
                  <Skeleton className="h-2.5 w-18 rounded" />
                </div>
                <Skeleton className="h-8 w-16 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <p className="text-xs text-rose-500 p-2 text-center">{error}</p>
        )}

        {!loading && !error && profiles.length === 0 && (
          <div className="py-12 text-center space-y-2">
            <div className="size-14 rounded-full bg-muted/60 grid place-content-center mx-auto text-muted-foreground">
              <Users className="size-7" />
            </div>
            <h3 className="text-sm font-bold text-foreground">
              {query
                ? "No matching users found"
                : friendFilter === "friends"
                ? "No friends yet"
                : "Type to find friends"}
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              {query
                ? "Try searching with a different username or full name."
                : "Search above to send friend invitations and split expenses."}
            </p>
          </div>
        )}

        {!loading && !error && profiles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {profiles.map((item) => {
              const isFriend =
                item.friend_request_status === undefined ||
                item.friend_request_status === "accepted";

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (isFriend) {
                      navigate(`/activity/${item.id}`);
                    }
                  }}
                  className={`flex items-center justify-between p-3.5 rounded-xl border border-border/70 dark:border-white/[0.06] bg-card transition-all ${
                    isFriend
                      ? "hover:border-primary/50 hover:shadow-sm hover:bg-muted/30 cursor-pointer active:scale-99"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <img
                      className="size-11 rounded-full object-cover shrink-0 border border-border/60"
                      src={item.profile_pic || AvtarImg}
                      alt={item.username}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = AvtarImg;
                      }}
                    />

                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-foreground truncate">
                        {item.full_name || item.username}
                      </h3>
                      <p className="text-[11px] text-muted-foreground truncate font-mono">
                        @{item.username}
                      </p>
                    </div>
                  </div>

                  {renderStatusAction(item)}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default SearchProfiles;

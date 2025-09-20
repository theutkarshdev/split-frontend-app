import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import axiosInstance from "@/lib/axiosInstance";
import {
  CircleCheckIcon,
  CircleXIcon,
  ClockIcon,
  LoaderCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/PageHeader";

interface FriendRequest {
  id: string;
  username: string;
  full_name: string;
  profile_pic: string;
  email: string;
  status: string;
  type: string;
}

const InvitationManager: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track per-request loading state
  const [loadingRequests, setLoadingRequests] = useState<
    Record<string, boolean>
  >({});

  const currentTab = (tabParam || "received").toLowerCase();

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get(
          `/friends/requests?filter=${currentTab}&status=pending`
        );
        setRequests(res.data);
      } catch (err: any) {
        setError(err.message || "Error fetching requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [currentTab]);

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const handleAction = async (
    request_id: string,
    action: "accept" | "reject"
  ) => {
    // Set this request as loading
    setLoadingRequests((prev) => ({ ...prev, [request_id]: true }));
    try {
      await axiosInstance.post("/friends/handle", {
        request_id,
        action,
      });
      // Remove from list
      setRequests((prev) => prev.filter((r) => r.id !== request_id));
      toast.success(`Request ${action}ed successfully.`);
    } catch (err: any) {
      console.error(err);
      toast.error("Action failed: " + (err.message || "unknown error"));
    } finally {
      // Clear loading state for this request
      setLoadingRequests((prev) => {
        const newState = { ...prev };
        delete newState[request_id];
        return newState;
      });
    }
  };

  return (
    <div>
      <PageHeader title="Invitation Manager" />

      {/* Tabs */}
      <div className="flex -mt-2 mb-3 justify-center">
        <button
          onClick={() => handleTabChange("received")}
          className={`w-1/2 px-3 py-1 rounded-t text-sm border-b-[3px] ${
            currentTab === "received" ? "border-primary" : "border-transparent"
          }`}
        >
          Received
        </button>
        <button
          onClick={() => handleTabChange("sent")}
          className={`w-1/2 px-3 py-1 rounded-t text-sm border-b-[3px] ${
            currentTab === "sent" ? "border-primary" : "border-transparent"
          }`}
        >
          Sent
        </button>
      </div>
      <div className="px-5">
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
        {error && <p className="text-red-500">Error: {error}</p>}

        {!loading && !error && (
          <>
            {requests.length === 0 ? (
              <div className="text-sm text-gray-500 p-2">
                <img
                  className="grayscale"
                  src="https://marketbold.com/images/no-results-found-youtube-search.gif"
                />
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between border-b p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        className="size-10 aspect-square object-cover rounded-full"
                        src={req.profile_pic || "/placeholder-avatar.png"}
                        alt={req.username}
                        loading="lazy"
                      />
                      <div>
                        <h3 className="text-md font-medium truncate">
                          {req.username}
                        </h3>
                        <p className="text-xs capitalize opacity-65 truncate">
                          {req.full_name}
                        </p>
                      </div>
                    </div>
                    <div className="opacity-55">
                      {currentTab === "received" ? (
                        loadingRequests[req.id] ? (
                          <LoaderCircle className="animate-spin opacity-55" />
                        ) : (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAction(req.id, "accept")}
                              title="Accept"
                            >
                              <CircleCheckIcon className="text-green-600 hover:text-green-700" />
                            </button>
                            <button
                              onClick={() => handleAction(req.id, "reject")}
                              title="Reject"
                            >
                              <CircleXIcon className="text-red-600 hover:text-red-700" />
                            </button>
                          </div>
                        )
                      ) : req.status === "pending" ? (
                        <ClockIcon />
                      ) : (
                        <CircleXIcon />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InvitationManager;

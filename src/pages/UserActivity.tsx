import PageHeader from "@/components/PageHeader";
import { useParams } from "react-router";
import AvtarImg from "@/assets/Profile_avatar_placeholder_large.png";
import { Button } from "@/components/ui/button";
import { CheckIcon, XIcon } from "lucide-react";
import AddActivityForm from "@/components/AddActivity";
import { useEffect, useState, useMemo, useRef } from "react";
import axiosInstance from "@/lib/axiosInstance";
import toast from "react-hot-toast";
import { Squircle } from "@squircle-js/react";

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

interface ActivitiesData {
  data: Activity[];
  finalAmount: number;
  type: "owed" | "paid";
  user_info: UserInfo;
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
  const isAccepted = status === "accepted";

  const formattedTime = new Date(created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Squircle
      cornerRadius={20}
      cornerSmoothing={1}
      className={`max-w-4/5 md:max-w-72 w-full shadow-md mb-3 bg-gray-200 p-[1.5px]  ${
        isOwed ? "" : "ml-auto"
      }`}
    >
      <Squircle
        cornerRadius={19}
        cornerSmoothing={1}
        className={`p-3 border-b-4 border-b-primary ${
          isOwed ? "bg-white" : "bg-blue-50 ml-auto"
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

        {note && <div className="text-gray-700 text-sm mt-1">{note}</div>}

        {attachment && (
          <Squircle
            cornerRadius={11}
            cornerSmoothing={1}
            className="mt-2 p-[1.5px] bg-border"
          >
            <Squircle cornerRadius={10} cornerSmoothing={1} className="bg-white">
              <img
                src={attachment}
                alt="attachment"
                className="w-full h-32 object-cover rounded"
              />
            </Squircle>
          </Squircle>
        )}

        {!isAccepted && to_user_id !== current_user_id && (
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
  const [activitiesData, setActivitiesData] = useState<ActivitiesData>({
    data: [],
    finalAmount: 0,
    type: "owed",
    user_info: { id: "" },
  });
  const [loading, setLoading] = useState(true);

  // ✅ Make fetch function reusable
  const fetchUserActivities = async () => {
    try {
      const res = await axiosInstance.get<ActivitiesData>(
        `/activities/between/${id}?limit=10&page=1`
      );
      setActivitiesData(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch activities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserActivities();
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
      fetchUserActivities();
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

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [activitiesData]); // scroll when data changes

  const user = activitiesData.user_info;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">Loading...</div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
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
                {user.username || "Username"}
              </h3>
              <p className="text-xs capitalize opacity-65 truncate">
                {user.full_name || "Full Name"}
              </p>
            </div>
          </div>
        }
      />

      <div ref={containerRef} className="p-5 grow flex flex-col overflow-auto">
        {sortedDates.length === 0 ? (
          <p className="text-center text-gray-500 mt-5">No activities found</p>
        ) : (
          sortedDates.map((date) => (
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
          ))
        )}
      </div>

      <div className="px-5 border-t py-5 w-full bg-card flex items-center">
        <p className="text-lg font-bold grow">
          You {activitiesData.type === "owed" ? "Owed" : "Paid"}:{" "}
          <span
            className={
              activitiesData.type === "owed" ? "text-red-500" : "text-green-500"
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
    </div>
  );
};

export default UserActivity;

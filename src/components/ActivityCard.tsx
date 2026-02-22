import { useNavigate } from "react-router";
import { CircleAlertIcon, IndianRupeeIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CustomCard from "@/components/CustomCard";
import { formatDateTime } from "@/lib/utils";
import { getInitials } from "@/lib/helpers";
import type { Activity } from "@/types/activity";

const getStatusText = (status: string) => {
  switch (status) {
    case "rejected":
      return (
        <p className="text-xs flex items-center gap-1 text-red-400">
          Rejected <CircleAlertIcon className="size-3" />
        </p>
      );
    case "pending":
      return (
        <p className="text-xs flex items-center gap-1 text-yellow-600">
          Pending <CircleAlertIcon className="size-3" />
        </p>
      );
    default:
      return null;
  }
};

interface ActivityCardProps {
  activity: Activity;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  const navigate = useNavigate();

  const isGroup = !!activity.group;
  const displayName = isGroup
    ? activity.group!.name
    : (activity.other_user?.username ?? "Unknown User");
  const subtitle = activity.other_user?.full_name ?? "No Name";
  const avatarSrc = isGroup
    ? activity.group!.image || undefined
    : activity.other_user?.profile_pic || undefined;
  const avatarAlt = isGroup
    ? activity.group!.name
    : (activity.other_user?.full_name ?? "No Name");
  const initials = getInitials(
    isGroup ? activity.group!.name : activity.other_user?.full_name,
  );

  const handleClick = () => {
    if (activity.group) {
      navigate(`/groups/${activity.group.id}/${activity.group.activity_id}`);
    } else if (activity.other_user) {
      navigate(`/activity/${activity.other_user.id}/${activity.id}`);
    }
  };

  return (
    <CustomCard
      key={activity.id}
      radius={15}
      className="flex gap-2 items-center p-3 cursor-pointer"
      onClick={handleClick}
    >
      <Avatar className="size-10">
        <AvatarImage src={avatarSrc} alt={avatarAlt} className="object-cover" />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <div className="grow overflow-hidden">
        <h3 className="text-md font-medium truncate">{displayName}</h3>
        <p className="text-xs capitalize opacity-65 truncate">{subtitle}</p>
        <p className="text-[9px] text-gray-500">
          {formatDateTime(activity.created_at)}
        </p>
      </div>

      <div className="text-right">
        <span
          className={`text-sm font-semibold flex items-center justify-end ${
            activity.type === "paid" ? "text-green-500" : "text-red-400"
          }`}
        >
          <IndianRupeeIcon className="size-3" />
          {activity.amount ?? 0}
        </span>
        {getStatusText(activity.status)}
      </div>
    </CustomCard>
  );
};

export default ActivityCard;

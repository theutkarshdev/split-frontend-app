import PageLayout from "@/components/PageLayout";
import axiosInstance from "@/lib/axiosInstance";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  EllipsisVerticalIcon,
  PlusIcon,
  ScaleIcon,
  UsersIcon,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { GroupActivity, GroupActivitiesResponse } from "@/types/activity";
import CustomCard from "@/components/CustomCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/helpers";
import NoDataFound from "@/components/NoDataFound";

interface GroupDetails {
  id: string;
  name: string;
  description: string;
  image: string;
  created_by: string;
  creator_name: string;
  is_admin: boolean;
  created_at: string;
}

interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  username: string;
  full_name: string;
  profile_pic: string | null;
  role: "admin" | "member";
  joined_at: string;
}

interface MemberBalance {
  user_id: string;
  username: string;
  full_name: string;
  profile_pic: string | null;
  balance: number;
}

interface GroupBalancesResponse {
  group_id: string;
  group_name: string;
  balances: MemberBalance[];
  total_expenses: number;
}

interface GroupActivityCardProps {
  activity: GroupActivity;
}

const GroupActivityCard: React.FC<GroupActivityCardProps> = ({ activity }) => {
  const navigate = useNavigate();

  const formattedTime = new Date(activity.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const pendingSplits = activity.splits.filter((s) => s.status === "pending");

  return (
    <CustomCard
      radius={20}
      pClassName="w-full shadow-md mb-3 bg-input p-[1.5px]"
      className="p-3 border-b-4 border-b-primary bg-card"
    >
      <div onClick={() => navigate(activity.id)} className="cursor-pointer">
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold">
            ₹{activity.total_amount.toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground">
            {activity.split_type}
          </span>
        </div>

        {activity.note && (
          <div className="text-sm my-1 text-muted-foreground">
            {activity.note}
          </div>
        )}

        <div className="text-xs text-muted-foreground mb-2">
          Paid by <span className="font-medium">{activity.paid_by_name}</span>
        </div>

        {activity.attachment && (
          <CustomCard radius={12} className="mb-2">
            <img
              src={activity.attachment}
              alt="attachment"
              className="w-full h-32 object-cover rounded"
            />
          </CustomCard>
        )}

        {/* Member Splits Preview */}
        <div className="flex items-center gap-1 mt-2">
          <div className="flex -space-x-2">
            {activity.splits.slice(0, 4).map((split) => (
              <Avatar
                key={split.user_id}
                className="size-6 border-2 border-card bg-card"
              >
                <AvatarImage
                  src={split.profile_pic || undefined}
                  alt={split.username}
                  className="object-cover"
                />
                <AvatarFallback className="text-xs">
                  {getInitials(split.full_name, "?")}
                </AvatarFallback>
              </Avatar>
            ))}
            {activity.splits.length > 4 && (
              <Avatar className="size-6 border-2 border-card bg-muted">
                <AvatarFallback className="text-xs bg-muted">
                  +{activity.splits.length - 4}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          <span className="text-xs text-muted-foreground ml-2">
            {pendingSplits.length > 0
              ? `${pendingSplits.length} pending`
              : "All settled"}
          </span>
        </div>

        <div className="text-xs text-gray-500 mt-2 text-right">
          {activity.member_count} members | {formattedTime}
        </div>
      </div>
    </CustomCard>
  );
};

const GroupDetail = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const [groupActivitiesData, setGroupActivitiesData] = useState<
    GroupActivity[]
  >([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersDrawerOpen, setMembersDrawerOpen] = useState(false);
  const [groupBalances, setGroupBalances] =
    useState<GroupBalancesResponse | null>(null);
  const [balancesLoading, setBalancesLoading] = useState(false);
  const [balancesDrawerOpen, setBalancesDrawerOpen] = useState(false);
  const [groupDetailsLoading, setGroupDetailsLoading] = useState<boolean>(true);
  const [groupActivitiesLoading, setGroupActivitiesLoading] =
    useState<boolean>(true);

  const fetchGroupDetails = async (id: string) => {
    try {
      const res = await axiosInstance.get(`/groups/${id}`);
      setGroupDetails(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setGroupDetailsLoading(false);
    }
  };

  const fetchGroupMembers = async (id: string) => {
    try {
      setMembersLoading(true);
      const res = await axiosInstance.get<GroupMember[]>(
        `/groups/${id}/members`
      );
      setGroupMembers(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setMembersLoading(false);
    }
  };

  const fetchGroupBalances = async (id: string) => {
    try {
      setBalancesLoading(true);
      const res = await axiosInstance.get<GroupBalancesResponse>(
        `/groups/${id}/balances`
      );
      setGroupBalances(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setBalancesLoading(false);
    }
  };

  const groupActivities = async (id: string) => {
    try {
      const res = await axiosInstance.get<GroupActivitiesResponse>(
        `/groups/${id}/activities`
      );
      setGroupActivitiesData(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setGroupActivitiesLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails(groupId);
      groupActivities(groupId);
    }
  }, [groupId]);

  // Group activities by date
  const groupedByDate = useMemo(() => {
    const grouped = groupActivitiesData.reduce<Record<string, GroupActivity[]>>(
      (acc, activity) => {
        const dateKey = new Date(activity.created_at).toLocaleDateString(
          "en-GB",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        );
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(activity);
        return acc;
      },
      {}
    );

    // Sort each date's activities by time (newest first)
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    return grouped;
  }, [groupActivitiesData]);

  // Sort dates descending (newest first)
  const sortedDates = useMemo(
    () =>
      Object.keys(groupedByDate).sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime()
      ),
    [groupedByDate]
  );

  const renderTitle = () => {
    return (
      <>
        {groupDetailsLoading ? (
          <div>Loading...</div>
        ) : groupDetails ? (
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage
                src={groupDetails.image}
                alt={groupDetails.name}
                className="object-cover"
              />
              <AvatarFallback>
                <UsersIcon className="size-5 text-primary" />
              </AvatarFallback>
            </Avatar>

            <h3 className="text-md font-medium truncate">
              {groupDetails.name}
            </h3>
          </div>
        ) : (
          <div>Group not found</div>
        )}
      </>
    );
  };

  const handleMembersDrawerOpen = (open: boolean) => {
    setMembersDrawerOpen(open);
    if (open && groupId && groupMembers.length === 0) {
      fetchGroupMembers(groupId);
    }
  };

  const handleBalancesDrawerOpen = (open: boolean) => {
    setBalancesDrawerOpen(open);
    if (open && groupId && !groupBalances) {
      fetchGroupBalances(groupId);
    }
  };

  const renderRightElement = () => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-9">
            <EllipsisVerticalIcon className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleMembersDrawerOpen(true)}>
            <UsersIcon className="size-4 mr-2" />
            View Members
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBalancesDrawerOpen(true)}>
            <ScaleIcon className="size-4 mr-2" />
            View Balances
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <PageLayout
      title={renderTitle()}
      isNav={false}
      className="flex flex-col !p-0"
      rightElement={renderRightElement()}
    >
      {groupActivitiesLoading ? (
        <div className="flex flex-col h-full p-5">
          <div className="space-y-3 flex-1 overflow-auto">
            {[...Array(4)].map((_, i) => (
              <CustomCard
                key={i}
                radius={20}
                pClassName="w-full bg-card"
                className="p-3"
              >
                <Skeleton className="w-24 h-8 rounded-lg mb-3" />
                <Skeleton className="w-full h-4 rounded-lg mb-2" />
                <Skeleton className="w-32 h-3 rounded-lg mb-3" />
                <div className="flex gap-1">
                  {[...Array(4)].map((_, j) => (
                    <Skeleton key={j} className="size-6 rounded-full" />
                  ))}
                </div>
                <Skeleton className="w-24 h-3 rounded-lg mt-2 ml-auto" />
              </CustomCard>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-5 grow flex flex-col overflow-auto relative">
          {sortedDates.length === 0 ? (
            <div className="text-center">
              <NoDataFound errorMsg={"No activities found"} />
              <Button
                size="lg"
                className="rounded-full mt-5"
                onClick={() => navigate(`/groups/${groupId}/create`)}
              >
                <PlusIcon className="size-8" /> Add Activity
              </Button>
            </div>
          ) : (
            <div>
              {sortedDates.map((date) => (
                <div key={date}>
                  <div className="sticky top-0 z-10 mb-2 text-center text-xs font-medium text-gray-500">
                    <span className="bg-gray-200 dark:bg-gray-800 rounded-full px-3 py-1 inline-block">
                      {date}
                    </span>
                  </div>

                  {groupedByDate[date].map((activity) => (
                    <GroupActivityCard key={activity.id} activity={activity} />
                  ))}
                </div>
              ))}

              {/* Add Activity Button */}
              <Button
                onClick={() => navigate(`/groups/${groupId}/create`)}
                className="absolute bottom-4 right-4 rounded-full size-12"
                size="icon"
              >
                <PlusIcon className="size-8" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Members Drawer */}
      <Drawer open={membersDrawerOpen} onOpenChange={handleMembersDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <UsersIcon className="size-5" />
              Group Members ({groupMembers.length})
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-3 max-h-[60vh] overflow-auto">
            {membersLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : groupMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No members found
              </p>
            ) : (
              groupMembers.map((member) => (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between py-2 border-b border-dashed last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 border">
                      <AvatarImage
                        src={member.profile_pic || undefined}
                        alt={member.username}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        {getInitials(member.full_name, "U")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold flex items-center gap-2">
                        {member.full_name}
                        {member.role === "admin" && (
                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                            Admin
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{member.username}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Balances Drawer */}
      <Drawer open={balancesDrawerOpen} onOpenChange={handleBalancesDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <ScaleIcon className="size-5" />
              Group Balances
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-3 max-h-[60vh] overflow-auto">
            {balancesLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            ) : !groupBalances ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Failed to load balances
              </p>
            ) : (
              <>
                {/* Total Expenses */}
                <div className="bg-muted/50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-muted-foreground">
                    Total Expenses
                  </p>
                  <p className="text-xl font-bold">
                    ₹{groupBalances.total_expenses.toLocaleString()}
                  </p>
                </div>

                {/* Balances List */}
                {groupBalances.balances.map((member) => (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between py-2 border-b border-dashed last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 border">
                        <AvatarImage
                          src={member.profile_pic || undefined}
                          alt={member.username}
                          className="object-cover"
                        />
                        <AvatarFallback>
                          {getInitials(member.full_name, "U")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">
                          {member.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{member.username}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold ${
                          member.balance > 0
                            ? "text-green-600"
                            : member.balance < 0
                            ? "text-red-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        {member.balance > 0
                          ? `+₹${member.balance.toLocaleString()}`
                          : member.balance < 0
                          ? `-₹${Math.abs(member.balance).toLocaleString()}`
                          : "₹0"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {member.balance > 0
                          ? "gets back"
                          : member.balance < 0
                          ? "owes"
                          : "settled"}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </PageLayout>
  );
};

export default GroupDetail;

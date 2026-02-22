import PageLayout from "@/components/PageLayout";
import axiosInstance from "@/lib/axiosInstance";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  EllipsisVerticalIcon,
  InfoIcon,
  LogOutIcon,
  PencilIcon,
  PlusIcon,
  ReceiptTextIcon,
  ScaleIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
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
  balance_type: "paid" | "owed";
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
  const [groupBalances, setGroupBalances] =
    useState<GroupBalancesResponse | null>(null);
  const [balancesLoading, setBalancesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("expenses");
  const [leaveDrawerOpen, setLeaveDrawerOpen] = useState(false);
  const [deleteDrawerOpen, setDeleteDrawerOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
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
      fetchGroupMembers(groupId);
      fetchGroupBalances(groupId);
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

  const handleLeaveGroup = async () => {
    if (!groupId) return;
    try {
      setActionLoading(true);
      await axiosInstance.post(`/groups/${groupId}/leave`);
      navigate("/groups");
    } catch (error) {
      console.log(error);
    } finally {
      setActionLoading(false);
      setLeaveDrawerOpen(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!groupId) return;
    try {
      setActionLoading(true);
      await axiosInstance.delete(`/groups/${groupId}`);
      navigate("/groups");
    } catch (error) {
      console.log(error);
    } finally {
      setActionLoading(false);
      setDeleteDrawerOpen(false);
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
          <DropdownMenuItem onClick={() => setLeaveDrawerOpen(true)}>
            <LogOutIcon className="size-4 mr-2" />
            Leave Group
          </DropdownMenuItem>
          {groupDetails?.is_admin && (
            <>
              <DropdownMenuItem
                onClick={() => navigate(`/groups/${groupId}/edit`)}
              >
                <PencilIcon className="size-4 mr-2" />
                Edit Group
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setDeleteDrawerOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2Icon className="size-4 mr-2" />
                Delete Group
              </DropdownMenuItem>
            </>
          )}
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
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col h-full"
      >
        <TabsList className="grid w-full grid-cols-3 mx-auto rounded-none">
          <TabsTrigger value="expenses" className="gap-1">
            <ReceiptTextIcon className="size-4" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="balances" className="gap-1">
            <ScaleIcon className="size-4" />
            Balances
          </TabsTrigger>
          <TabsTrigger value="info" className="gap-1">
            <InfoIcon className="size-4" />
            Info
          </TabsTrigger>
        </TabsList>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="flex-1 overflow-auto m-0">
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
            <div className="p-5 grow flex flex-col h-full relative">
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
                <div className="grow overflow-auto">
                  {sortedDates.map((date) => (
                    <div key={date}>
                      <div className="sticky top-0 z-10 mb-2 text-center text-xs font-medium text-gray-500">
                        <span className="bg-gray-200 dark:bg-gray-800 rounded-full px-3 py-1 inline-block">
                          {date}
                        </span>
                      </div>

                      {groupedByDate[date].map((activity) => (
                        <GroupActivityCard
                          key={activity.id}
                          activity={activity}
                        />
                      ))}
                    </div>
                  ))}

                  {/* Add Activity Button */}
                  <Button
                    onClick={() => navigate(`/groups/${groupId}/create`)}
                    className="absolute bottom-5 right-5 rounded-full size-12"
                    size="icon"
                  >
                    <PlusIcon className="size-8" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Balances Tab */}
        <TabsContent value="balances" className="flex-1 overflow-auto m-0">
          <div className="p-4 space-y-3">
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
                          member.balance === 0
                            ? "text-muted-foreground"
                            : member.balance_type === "paid"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {member.balance === 0
                          ? "₹0"
                          : member.balance_type === "paid"
                          ? `+₹${member.balance.toLocaleString()}`
                          : `-₹${member.balance.toLocaleString()}`}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {member.balance === 0
                          ? "settled"
                          : member.balance_type === "paid"
                          ? "gets back"
                          : "owes"}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </TabsContent>

        {/* Info Tab */}
        <TabsContent value="info" className="flex-1 overflow-auto m-0">
          <div className="p-4">
            {/* Group Info Section */}
            {groupDetailsLoading ? (
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="size-16 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full rounded-lg mb-4" />
                <Skeleton className="h-3 w-40" />
              </div>
            ) : groupDetails ? (
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="size-16 border">
                    <AvatarImage
                      src={groupDetails.image}
                      alt={groupDetails.name}
                      className="object-cover"
                    />
                    <AvatarFallback>
                      <UsersIcon className="size-8 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-bold">{groupDetails.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      Created by {groupDetails.creator_name}
                    </p>
                  </div>
                </div>
                {groupDetails.description && (
                  <div className="bg-muted/50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-muted-foreground mb-1">
                      Description
                    </p>
                    <p className="text-sm">{groupDetails.description}</p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Created on{" "}
                  {new Date(groupDetails.created_at).toLocaleDateString(
                    "en-GB",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Failed to load group details
              </p>
            )}

            {/* Members Section */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <UsersIcon className="size-4" />
                Members ({groupMembers.length})
              </h4>
              <div className="space-y-3">
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
                  <p className="text-sm text-muted-foreground text-center py-4">
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
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Leave Group Drawer */}
      <Drawer open={leaveDrawerOpen} onOpenChange={setLeaveDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <LogOutIcon className="size-5" />
              Leave Group
            </DrawerTitle>
            <DrawerDescription>
              Are you sure you want to leave "{groupDetails?.name}"? You will
              need an invitation to rejoin.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setLeaveDrawerOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleLeaveGroup}
              disabled={actionLoading}
            >
              {actionLoading ? "Leaving..." : "Leave Group"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Delete Group Drawer */}
      <Drawer open={deleteDrawerOpen} onOpenChange={setDeleteDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2 text-destructive">
              <Trash2Icon className="size-5" />
              Delete Group
            </DrawerTitle>
            <DrawerDescription>
              Are you sure you want to delete "{groupDetails?.name}"? This
              action cannot be undone and all group data will be permanently
              removed.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteDrawerOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDeleteGroup}
              disabled={actionLoading}
            >
              {actionLoading ? "Deleting..." : "Delete Group"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </PageLayout>
  );
};

export default GroupDetail;

import PageLayout from "@/components/PageLayout";
import CustomCard from "@/components/CustomCard";
import NoDataFound from "@/components/NoDataFound";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  UsersIcon,
  ChevronRightIcon,
  PlusIcon,
  SearchIcon,
  SlidersVerticalIcon,
} from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface Group {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  member_count: number;
  created_at: string;
}

const GroupListPage = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/groups");
      setGroups(res.data || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <PageLayout title="My Groups" className="relative flex flex-col">
      <div className="flex gap-2 items-center mb-5">
        <CustomCard
          radius={10}
          pClassName="group focus-within:bg-primary/50 transition-colors duration-200 grow h-12"
          className="h-full flex items-center w-full"
        >
          <div className="relative w-full">
            <Input
              className="border-none font-medium outline-none !ring-0 h-12"
              placeholder={`Search Groups`}
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
              <DropdownMenuRadioGroup>
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

      {/* Loading State */}
      {loading && (
        <div className="space-y-3">
          {[...Array(8)].map((_, idx) => (
            <CustomCard key={idx} radius={18} className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </CustomCard>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && groups.length === 0 && (
        <div className=" text-center">
          <NoDataFound errorMsg="No groups yet" />
          <Button
            size="lg"
            className="rounded-full mt-5"
            onClick={() => navigate("/groups/create")}
          >
            <PlusIcon className="size-8" /> Create New Group
          </Button>
        </div>
      )}

      {/* Groups List */}
      {!loading && groups.length > 0 && (
        <div className="space-y-3 flex-1 overflow-y-auto">
          {groups.map((group) => (
            <CustomCard
              key={group.id}
              radius={18}
              className="p-4 cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => navigate(`/groups/${group.id}`)}
            >
              <div className="flex items-center gap-3">
                {/* Group Avatar */}
                <CustomCard
                  radius={12}
                  className="size-12 overflow-hidden flex-shrink-0"
                >
                  {group.image && group.image !== "string" ? (
                    <Avatar className="size-full rounded-none">
                      <AvatarImage
                        src={group.image}
                        alt={group.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="rounded-none">
                        <UsersIcon className="size-5 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="size-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <UsersIcon className="size-5 text-primary" />
                    </div>
                  )}
                </CustomCard>

                {/* Group Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{group.name}</h3>
                  {group.description && group.description !== "string" && (
                    <p className="text-xs text-muted-foreground truncate mb-1">
                      {group.description}
                    </p>
                  )}
                </div>

                {/* Arrow */}
                <ChevronRightIcon className="size-5 text-muted-foreground flex-shrink-0" />
              </div>
            </CustomCard>
          ))}

          <Button
            size="icon"
            className="absolute bottom-4 right-4 rounded-full size-12"
            onClick={() => navigate("/groups/create")}
          >
            <PlusIcon className="size-8" />
          </Button>
        </div>
      )}
    </PageLayout>
  );
};

export default GroupListPage;

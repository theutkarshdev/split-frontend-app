import { Input } from "@/components/ui/input";
import { BellIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import PageLayout from "@/components/PageLayout";
import CustomCard from "@/components/CustomCard";

const Dashboard = () => {
  const navigate = useNavigate();
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
          <span className="size-2 bg-red-400 absolute top-2 right-2 rounded-full"></span>
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

        <div className="grid grid-cols-3 gap-2 mt-4">
          {[...Array(9)].map((_, i) => (
            <CustomCard
              radius={25}
              key={i}
              className="w-full aspect-square bg-card grid place-content-center"
            >
              UK
            </CustomCard>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;

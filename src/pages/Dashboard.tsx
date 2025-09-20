import { Input } from "@/components/ui/input";
import { BellIcon, SearchIcon } from "lucide-react";
import { Squircle } from "@squircle-js/react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

const Dashboard = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div className="flex gap-3 items-center mb-4 px-5 pt-5">
        <h1 className="text-xl font-semibold grow">Hello, Good Morning..! </h1>
        <Button
          size="icon"
          className="relative rounded-full bg-slate-200 hover:bg-slate-200"
        >
          <BellIcon className="size-5 text-primary" />
          <span className="size-2 bg-red-400 absolute top-2 right-2 rounded-full"></span>
        </Button>
      </div>
      <div className="px-5">
        <Squircle
          cornerRadius={20}
          cornerSmoothing={1}
          className="bg-border p-[1.5px]"
        >
          <Squircle
            cornerRadius={19}
            cornerSmoothing={1}
            className="bg-white p-5 h-42"
          >
            Squircle!
          </Squircle>
        </Squircle>

        <Squircle
          cornerRadius={11}
          cornerSmoothing={1}
          className="group mt-4 bg-border p-[1.5px] focus-within:bg-primary/50 transition-colors duration-200 grow h-[2.8rem]"
        >
          <Squircle
            cornerRadius={10}
            cornerSmoothing={1}
            className="bg-white h-full flex items-center w-full"
          >
            <div className="relative w-full">
              <Input
                className="border-none font-medium outline-none !ring-0"
                placeholder="Search your friends here..."
                onClick={() => navigate("/search?friend_filter=friends")}
              />
              <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-border" />
            </div>
          </Squircle>
        </Squircle>

        <div className="grid grid-cols-3 gap-2 mt-4">
          {[...Array(9)].map(() => (
            <Squircle
              cornerRadius={20}
              cornerSmoothing={1}
              className="w-full aspect-square bg-slate-200 grid place-content-center"
            >
              UK
            </Squircle>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

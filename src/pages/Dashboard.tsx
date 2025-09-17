import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

const Dashboard = () => {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-3">Hello, Good Morning..! </h1>
      <div className="w-full h-40 bg-slate-200 border rounded-[3rem] squircle p-5">
        Card
      </div>
      <div className="mt-4 relative">
        <Input
          className="h-12 squircle rounded-[4rem] border-2 font-medium"
          placeholder="Search your friends here..."
        />
        <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-border" />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        {[...Array(9)].map(() => (
          <div className="w-full aspect-square bg-slate-200 rounded-[3rem] squircle grid place-content-center">
            {/* <img
              className="rounded-full size-20 border-2 border-slate-300"
              src="https://avatar.iran.liara.run/public"
            /> */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

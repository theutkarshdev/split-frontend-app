import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { Squircle } from "@squircle-js/react";

const Dashboard = () => {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-3">Hello, Good Morning..! </h1>
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

      <div className="mt-4 relative">
        <Input
          className="h-12 squircle rounded-[4rem] border-2 font-medium"
          placeholder="Search your friends here..."
        />
        <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-border" />
      </div>

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
  );
};

export default Dashboard;

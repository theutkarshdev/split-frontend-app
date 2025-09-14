import { BellDotIcon, HomeIcon, PlusCircleIcon } from "lucide-react";
import { Outlet } from "react-router";

const DashboardLayout = () => {
  // const token = localStorage.getItem("token");

  // if (!token) {
  //   return <Navigate to="/login" replace />;
  // }

  return (
    <div className="bg-black flex justify-center">
      <main className="w-full min-h-screen p-5 max-w-md bg-white">
        <Outlet />
      </main>

      <div className="fixed bottom-5 w-full px-5 max-w-xs">
        <div className="bg-primary p-3 text-white squircle rounded-4xl flex justify-around">
          <HomeIcon />
          <PlusCircleIcon />
          <BellDotIcon />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

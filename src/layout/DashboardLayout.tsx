import { BellDotIcon, HomeIcon, User2Icon } from "lucide-react";
import { Navigate, Outlet } from "react-router";
import { useAppContext } from "./AppContext";

const DashboardLayout = () => {
  const { auth, logout, loading } = useAppContext();

  if (loading) return <div>Loading...</div>;

  if (!auth.isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="bg-black flex justify-center">
      <main className="w-full min-h-screen p-5 max-w-md bg-white pb-20">
        <Outlet />
      </main>

      <div className="fixed bottom-0 w-full border-t bg-white">
        <div className="p-3 flex justify-around">
          <BellDotIcon onClick={() => logout()} />
          <HomeIcon />
          <User2Icon />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

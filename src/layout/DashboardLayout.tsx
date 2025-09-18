import { BellDotIcon, HomeIcon, User2Icon } from "lucide-react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router";
import { useAppContext } from "./AppContext";

const DashboardLayout = () => {
  const { auth, loading } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) return <div>Loading...</div>;

  if (!auth.isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (auth.is_new && location.pathname !== "/profile/complete") {
    return <Navigate to="/profile/complete" replace />;
  }

  return (
    <div className="bg-black flex justify-center">
      <main className="w-full min-h-screen p-5 max-w-md bg-white pb-20">
        <Outlet />
      </main>

      <div className="fixed bottom-0 w-full border-t bg-white">
        <div className="p-3 flex justify-around">
          <BellDotIcon />
          <HomeIcon />
          <User2Icon onClick={() => navigate("/profile")} />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

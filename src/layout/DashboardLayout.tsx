import { HomeIcon, SearchIcon, User2Icon } from "lucide-react";
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

  const navItems = [
    { icon: SearchIcon, path: "/search?friend_filter=all" },
    { icon: HomeIcon, path: "/" },
    { icon: User2Icon, path: "/profile" },
  ];

  const isActive = (path: string) => {
    const currentPath = location.pathname; // e.g., "/search"
    const navPath = path.split("?")[0]; // strip query params
    return currentPath === navPath || currentPath.startsWith(navPath + "/");
  };

  return (
    <div className="bg-black flex justify-center">
      <main className="w-full min-h-screen max-w-md bg-white pb-20">
        <Outlet />
      </main>

      <div className="fixed bottom-0 w-full border-t bg-white">
        <div className="p-3 flex justify-around">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div className="relative">
                {isActive(item.path) && (
                  <span className="w-10 h-1.5 bg-primary absolute -top-[0.78rem] rounded-b-2xl left-1/2 -translate-x-1/2"></span>
                )}

                <Icon
                  key={idx}
                  onClick={() => navigate(item.path)}
                  className={`cursor-pointer transition-colors`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

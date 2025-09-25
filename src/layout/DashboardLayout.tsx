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
    {
      name: "Search",
      icon: SearchIcon,
      path: "/search?friend_filter=all",
      isSearch: true,
    },
    { name: "Home", icon: HomeIcon, path: "/" },
    { name: "Profile", icon: User2Icon, path: "/profile" },
  ];

  const isActive = (path: string) => {
    const currentPath = location.pathname;
    const navPath = path.split("?")[0];
    return currentPath === navPath || currentPath.startsWith(navPath + "/");
  };

  return (
    <div className="bg-black flex flex-col h-svh items-center ">
      <main className="w-full max-w-md bg-white grow overflow-y-auto">
        <Outlet />
      </main>

      <div className="w-full border-t bg-white max-w-md">
        <div className="p-3 flex justify-around">
          {navItems.map((item, idx) => {
            const Icon = item.icon;

            // If this is the search icon, render a hidden input + label
            if (item.isSearch) {
              return (
                <div className="relative" key={idx}>
                  {isActive(item.path) && (
                    <span className="w-10 h-1.5 bg-primary absolute -top-[0.78rem] rounded-b-2xl left-1/2 -translate-x-1/2"></span>
                  )}

                  {/* Hidden input */}
                  <input
                    id="search-input"
                    type="text"
                    className="absolute opacity-0 w-0 h-0"
                    onFocus={() => navigate(item.path)}
                  />

                  {/* Label wraps the icon */}
                  <label
                    htmlFor="search-input"
                    className="flex flex-col justify-center items-center"
                  >
                    <Icon className="w-6 h-6 text-gray-700" />
                    <p className="text-xs text-center">{item.name}</p>
                  </label>
                </div>
              );
            }

            // Normal nav icons
            return (
              <div className="relative" key={idx}>
                {isActive(item.path) && (
                  <span className="w-10 h-1.5 bg-primary absolute -top-[0.78rem] rounded-b-2xl left-1/2 -translate-x-1/2"></span>
                )}
                <div className="flex flex-col justify-center items-center">
                  <Icon
                    onClick={() => navigate(item.path)}
                    className={`cursor-pointer transition-colors`}
                  />
                  <p className="text-xs">{item.name}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

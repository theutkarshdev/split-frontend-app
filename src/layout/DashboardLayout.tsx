import { Navigate, Outlet, useLocation } from "react-router";
import { useAppContext } from "@/hooks/useAppContext";

const DashboardLayout = () => {
  const { auth, loading } = useAppContext();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!auth.isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (auth.is_new && location.pathname !== "/profile/complete") {
    return <Navigate to="/profile/complete" replace />;
  }

  return <Outlet />;
};

export default DashboardLayout;

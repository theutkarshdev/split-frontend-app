import { Navigate, Outlet, useLocation } from "react-router";
import { useAppContext } from "@/hooks/useAppContext";

const AuthLayout = () => {
  const { auth, loading } = useAppContext();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (auth.isAuthenticated) {
    // if user came with a `from` route, go there instead of always "/"
    const from = (location.state as any)?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  return (
    <div className="flex justify-center">
      <main className="w-full min-h-svh overflow-x-hidden bg-slate-50 dark:bg-black">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;

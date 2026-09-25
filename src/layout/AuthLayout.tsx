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
    <main className="w-full min-h-svh bg-background text-foreground overflow-x-hidden">
      <Outlet />
    </main>
  );
};

export default AuthLayout;

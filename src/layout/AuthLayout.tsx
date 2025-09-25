import { Navigate, Outlet } from "react-router";
import { useAppContext } from "./AppContext";

const AuthLayout = () => {
  const { auth, loading } = useAppContext();

  if (loading) return <div>Loading...</div>;

  if (auth.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex justify-center">
      <main className="w-full min-h-svh overflow-x-hidden bg-white">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;

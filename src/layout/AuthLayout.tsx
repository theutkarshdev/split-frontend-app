import { Navigate, Outlet } from "react-router";
import { useAppContext } from "./AppContext";

const AuthLayout = () => {
  const { auth, loading } = useAppContext();

  if (loading) return <div>Loading...</div>;

  if (auth.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="bg-black flex justify-center">
      <main className="w-full min-h-screen px-5 max-w-md bg-white">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;

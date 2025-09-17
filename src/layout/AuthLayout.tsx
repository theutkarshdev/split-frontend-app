import { Navigate, Outlet } from "react-router";
import { useAppContext } from "./AppContext";

const AuthLayout = () => {
  const { auth, loading } = useAppContext();

  if (loading) return <div>Loading...</div>;

  if (auth.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
<<<<<<< HEAD
    <div className="bg-black flex justify-center">
      <main className="w-full min-h-screen px-5 max-w-md bg-white">
=======
    <div className="flex justify-center overflow-x-hidden">
      <main className="w-full min-h-screen px-5 bg-white">
>>>>>>> e024afe3d043844ab5adef82dbd10ff5a434dcc4
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;

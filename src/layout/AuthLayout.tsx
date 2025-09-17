import { Outlet } from "react-router";

const AuthLayout = () => {
  // const token = localStorage.getItem("token");

  // if (token) {
  //   return <Navigate to="/" replace />;
  // }

  return (
    <div className="flex justify-center">
      <main className="w-full min-h-screen overflow-x-hidden bg-white">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;

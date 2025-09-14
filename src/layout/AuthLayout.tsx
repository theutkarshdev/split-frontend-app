import { Outlet, Navigate } from "react-router";

const AuthLayout = () => {
  const token = localStorage.getItem("token");

  // if (token) {
  //   return <Navigate to="/" replace />;
  // }

  return (
    <div className="bg-black flex justify-center">
      <main className="w-full min-h-screen pt-14 px-5 max-w-md bg-white">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;

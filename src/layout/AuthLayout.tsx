import { Outlet } from "react-router";

const AuthLayout = () => {
  // const token = localStorage.getItem("token");

  // if (token) {
  //   return <Navigate to="/" replace />;
  // }

  return (
    <div className="flex justify-center overflow-x-hidden">
      <main className="w-full min-h-screen px-5 bg-white">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;

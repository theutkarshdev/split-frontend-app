import { useRoutes, type RouteObject } from "react-router";
import Dashboard from "@/pages/Dashboard";
import LoginPage from "@/pages/LoginPage";
import OtpPage from "@/pages/OtpPage";
import CompleteProfile from "@/pages/profile/CompleteProfile";
import UserProfile from "@/pages/profile/UserProfile";
import DashboardLayout from "./DashboardLayout";
import AuthLayout from "./AuthLayout";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "profile",
        children: [
          {
            index: true,
            element: <UserProfile />,
          },
          {
            path: "complete",
            element: <CompleteProfile />,
          },
        ],
      },
    ],
  },

  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "verify-otp",
        element: <OtpPage />,
      },
      {
        path: "*",
        element: <p>404 Error</p>,
      },
    ],
  },
];

const AppRoutes = () => useRoutes(routes);

export default AppRoutes;

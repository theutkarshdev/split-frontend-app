import { useRoutes, type RouteObject } from "react-router";
import Dashboard from "@/pages/Dashboard";
import LoginPage from "@/pages/LoginPage";
import OtpPage from "@/pages/OtpPage";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Dashboard />,
  },
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
];

const routeConfig = () => useRoutes(routes);

export default routeConfig;

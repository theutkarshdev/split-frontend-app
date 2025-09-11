import { useRoutes, type RouteObject } from "react-router";
import Dashboard from "@/pages/Dashboard";
import LoginPage from "@/pages/LoginPage";

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
    path: "*",
    element: <p>404 Error</p>,
  },
];

const routeConfig = () => useRoutes(routes);

export default routeConfig;

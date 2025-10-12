import { useRoutes, type RouteObject } from "react-router";
import Dashboard from "@/pages/Dashboard";
import CompleteProfile from "@/pages/profile/CompleteProfile";
import UserProfile from "@/pages/profile/UserProfile";
import DashboardLayout from "./DashboardLayout";
import AuthLayout from "./AuthLayout";
import SearchProfiles from "@/pages/SearchProfiles";
import InvitationManager from "@/pages/profile/InvitationManager";
import NotificationsPage from "@/pages/Notifications";
import UserActivity from "@/pages/activity/UserActivity";
import ActivityHistory from "@/pages/profile/ActivityHistory";
import ActivityDetail from "@/pages/activity/ActivityDetail";
import NewLogin from "@/pages/NewLogin";
import NewOtpPage from "@/pages/NewOtpPage";

export const routes: RouteObject[] = [
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
          {
            path: "invitation-manager",
            element: <InvitationManager />,
          },
          {
            path: "history",
            element: <ActivityHistory />,
          },
        ],
      },
      {
        path: "search",
        element: <SearchProfiles />,
      },
      {
        path: "notifications",
        element: <NotificationsPage />,
      },
      {
        path: "activity/:id",
        children: [
          {
            index: true,
            element: <UserActivity />,
          },
          {
            path: ":activityId",
            element: <ActivityDetail />,
          },
        ],
      },
    ],
  },

  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <NewLogin />,
      },
      {
        path: "verify-otp",
        element: <NewOtpPage />,
      },
    ],
  },

  {
    path: "*",
    element: <p>404 Error</p>,
  },
];

const AppRoutes = () => useRoutes(routes);

export default AppRoutes;

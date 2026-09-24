import { useState, useEffect, type ReactNode } from "react";
import PageHeader from "./PageHeader";
import { useLocation, useNavigate } from "react-router";
import {
  Home,
  Search,
  User,
  Bell,
  History,
  UserPlus,
  LogOut,
  Sun,
  Moon,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/hooks/useAppContext";
import axiosInstance from "@/lib/axiosInstance";
import AvtarImg from "@/assets/Profile_avatar_placeholder_large.png";
import { Button } from "./ui/button";

interface PageLayoutProps {
  title?: string | ReactNode;
  children: ReactNode;
  className?: string;
  isNav?: boolean;
  rightElement?: ReactNode;
  hideDesktopHeader?: boolean;
}

interface UserProfileSummary {
  full_name?: string;
  username?: string;
  profile_pic?: string;
}

const PageLayout = ({
  title,
  className,
  isNav = true,
  rightElement,
  hideDesktopHeader = false,
  children,
}: PageLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, theme, setTheme, logout } = useAppContext();

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [profile, setProfile] = useState<UserProfileSummary | null>(null);

  // Fetch unread count & user profile
  useEffect(() => {
    if (!auth.isAuthenticated) return;

    let isMounted = true;

    const fetchSummary = async () => {
      try {
        const [unreadRes, profileRes] = await Promise.allSettled([
          axiosInstance.get("/notifications/unread-count"),
          axiosInstance.get("/profile/me"),
        ]);

        if (isMounted) {
          if (unreadRes.status === "fulfilled" && unreadRes.value.data) {
            setUnreadCount(unreadRes.value.data.unread_count || 0);
          }
          if (profileRes.status === "fulfilled" && profileRes.value.data) {
            setProfile(profileRes.value.data);
          }
        }
      } catch (err) {
        console.error("Layout summary fetch error:", err);
      }
    };

    fetchSummary();

    return () => {
      isMounted = false;
    };
  }, [auth.isAuthenticated, location.pathname]);

  const navItems = [
    {
      name: "Dashboard",
      mobileName: "Home",
      icon: Home,
      path: "/",
      matchPrefix: "/",
      exact: true,
    },
    {
      name: "Find Friends",
      mobileName: "Search",
      icon: Search,
      path: "/search?friend_filter=all",
      matchPrefix: "/search",
    },
    {
      name: "Notifications",
      mobileName: "Alerts",
      icon: Bell,
      path: "/notifications",
      matchPrefix: "/notifications",
      badge: unreadCount > 0 ? unreadCount : undefined,
      desktopOnly: false,
    },
    {
      name: "Invitations",
      icon: UserPlus,
      path: "/profile/invitation-manager",
      matchPrefix: "/profile/invitation-manager",
      desktopOnly: true,
    },
    {
      name: "Expense History",
      icon: History,
      path: "/profile/history",
      matchPrefix: "/profile/history",
      desktopOnly: true,
    },
    {
      name: "My Profile",
      mobileName: "Profile",
      icon: User,
      path: "/profile",
      matchPrefix: "/profile",
      exact: true,
    },
  ];

  const isItemActive = (item: (typeof navItems)[0]) => {
    const currentPath = location.pathname;
    if (item.exact) {
      return currentPath === item.matchPrefix;
    }
    return currentPath === item.matchPrefix || currentPath.startsWith(item.matchPrefix + "/");
  };

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const mobileNavItems = navItems.filter((i) => !i.desktopOnly);

  return (
    <div className="h-svh w-full flex bg-background text-foreground antialiased overflow-hidden">
      {/* ========================================================
          DESKTOP SIDEBAR (Visible on laptop/desktop: lg and up)
         ======================================================== */}
      <aside className="hidden lg:flex w-64 xl:w-72 h-screen border-r border-border/80 dark:border-white/[0.08] bg-card flex-col justify-between p-5 shrink-0 z-30 select-none">
        <div className="space-y-6">
          {/* Brand Header */}
          <div
            onClick={() => navigate("/")}
            className="cursor-pointer group px-2 py-1 select-none"
          >
            <div className="text-2xl font-extrabold tracking-tight text-foreground group-hover:opacity-85 transition-opacity">
              Spilly
            </div>
            <p className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
              Expense Tracker
            </p>
          </div>

          {/* Quick Action Button on Desktop */}
          <Button
            onClick={() => navigate("/search?friend_filter=all")}
            className="w-full h-11 px-5 rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
          >
            <Plus className="size-4" /> Split New Expense
          </Button>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item);

              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer",
                    active
                      ? "bg-primary text-primary-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("size-4.5", active ? "text-primary-foreground" : "text-muted-foreground")} />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && item.badge > 0 && (
                    <span
                      className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded-full",
                        active
                          ? "bg-background text-foreground"
                          : "bg-destructive text-white"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-3 pt-4 border-t border-border/80 dark:border-white/[0.08]">
          <div
            onClick={() => navigate("/profile")}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={profile?.profile_pic || AvtarImg}
                alt={profile?.username || "User"}
                className="size-9 rounded-full object-cover border border-border"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate">
                  {profile?.full_name || "My Account"}
                </p>
                <p className="text-[11px] text-muted-foreground truncate font-mono">
                  @{profile?.username || "user"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setTheme(isDark ? "light" : "dark");
              }}
              className="size-9 rounded-lg hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Toggle dark/light mode"
            >
              {isDark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
            </button>
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="size-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ========================================================
          MAIN VIEWPORT
         ======================================================== */}
      <div className="flex-1 flex flex-col h-full min-h-0 min-w-0 overflow-hidden relative">
        {/* DESKTOP TOP BAR (Visible on lg and up) */}
        {!hideDesktopHeader && (
          <header className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-border/80 dark:border-white/[0.08] bg-card shrink-0 z-20">
            <div className="flex items-center gap-3">
              {typeof title === "string" ? (
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  {title}
                </h1>
              ) : (
                title
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/search?friend_filter=all")}
                className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-border bg-muted/40 hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                <Search className="size-4" />
                <span>Search friends or activities...</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/notifications")}
                className="relative size-10 rounded-xl border border-border hover:bg-muted flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="size-4.5 text-foreground/80" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 size-2 bg-rose-500 rounded-full" />
                )}
              </button>

              {rightElement && (
                <div className="flex items-center gap-2">{rightElement}</div>
              )}
            </div>
          </header>
        )}

        {/* ========================================================
            MOBILE HEADER (Pinned to top on < lg screens with Safe Area)
           ======================================================== */}
        <header className="lg:hidden shrink-0 z-30 pt-safe glass-nav border-b border-border/80 dark:border-white/[0.08] shadow-xs">
          <div className="h-14 px-4 flex items-center justify-between">
            {title ? (
              <PageHeader title={title} rightElement={rightElement} />
            ) : (
              <div className="w-full flex items-center justify-between">
                <div
                  onClick={() => navigate("/")}
                  className="flex items-baseline gap-2 cursor-pointer select-none"
                >
                  <span className="text-xl font-extrabold tracking-tight text-foreground">
                    Spilly
                  </span>
                  <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Expense Tracker
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate("/notifications")}
                    className="relative size-9 rounded-xl border border-border/80 bg-card hover:bg-muted flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                    aria-label="View notifications"
                  >
                    <Bell className="size-4.5 text-foreground/80" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 size-2 bg-rose-500 rounded-full" />
                    )}
                  </button>
                  {rightElement && <div>{rightElement}</div>}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* SCROLLABLE MAIN CONTENT AREA */}
        <main
          className={cn(
            "flex-1 relative w-full min-h-0 overflow-y-auto overflow-x-hidden scroll-smooth",
            isNav ? "pb-8 sm:pb-10 lg:pb-0" : "pb-4 sm:pb-6",
            className
          )}
        >
          {children}
        </main>

        {/* ========================================================
            MOBILE BOTTOM NAVIGATION (Pinned to bottom on < lg with Safe Area)
           ======================================================== */}
        {isNav && (
          <nav className="lg:hidden shrink-0 z-30 pb-safe glass-nav border-t border-border/80 dark:border-white/[0.08] shadow-lg">
            <div className="h-16 px-4 flex justify-around items-center">
              {mobileNavItems.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item);

                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "relative flex flex-col items-center justify-center py-1.5 px-4 rounded-xl transition-all duration-150 cursor-pointer tap-highlight-none",
                      active
                        ? "text-primary font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    aria-label={item.name}
                  >
                    {active && (
                      <span className="absolute -top-2 w-8 h-1 rounded-full bg-primary" />
                    )}
                    <div className="relative">
                      <Icon
                        className={cn(
                          "size-5 transition-transform duration-150",
                          active && "scale-110 stroke-[2.25]"
                        )}
                      />
                      {item.badge && item.badge > 0 && (
                        <span className="absolute -top-1 -right-1.5 size-2 bg-rose-500 rounded-full" />
                      )}
                    </div>
                    <span className="text-xs mt-1 tracking-tight leading-none">
                      {item.mobileName || item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
};

export default PageLayout;

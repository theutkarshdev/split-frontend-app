import type { ReactNode } from "react";
import PageHeader from "./PageHeader";
import { useLocation, useNavigate } from "react-router";
import { HomeIcon, SearchIcon, User2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  title?: string | ReactNode;
  children: ReactNode;
  className?: string;
  isNav?: boolean;
  rightElement?: ReactNode;
}

const PageLayout = ({ title, className, isNav=true, rightElement, children }: PageLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      name: "Search",
      icon: SearchIcon,
      path: "/search?friend_filter=all",
      isSearch: true,
    },
    { name: "Home", icon: HomeIcon, path: "/" },
    { name: "Profile", icon: User2Icon, path: "/profile" },
  ];

  const isActive = (path: string) => {
    const currentPath = location.pathname;
    const navPath = path.split("?")[0];
    return currentPath === navPath || currentPath.startsWith(navPath + "/");
  };

  return (
    <div className="bg-foreground">
      <main className="w-full max-w-md flex flex-col h-svh mx-auto">
        {title && <PageHeader title={title} rightElement={rightElement} />}
        <div
          className={cn(`p-5 bg-slate-50 dark:bg-black flex-1 overflow-y-auto`, className)}
        >
          {children}
        </div>
        {isNav && (
          <nav className="w-full border-t bg-card max-w-md">
            <div className="p-3 flex justify-around">
              {navItems.map((item, idx) => {
                const Icon = item.icon;

                // If this is the search icon, render a hidden input + label
                if (item.isSearch) {
                  return (
                    <div className="relative" key={idx}>
                      {isActive(item.path) && (
                        <span className="w-10 h-1.5 bg-primary absolute -top-[0.78rem] rounded-b-2xl left-1/2 -translate-x-1/2"></span>
                      )}

                      {/* Hidden input */}
                      <input
                        id="search-input"
                        type="text"
                        className="absolute opacity-0 w-0 h-0"
                        onFocus={() => navigate(item.path)}
                      />

                      {/* Label wraps the icon */}
                      <label
                        htmlFor="search-input"
                        className="flex flex-col justify-center items-center"
                      >
                        <Icon className="w-6 h-6" />
                        <p className="text-xs text-center">{item.name}</p>
                      </label>
                    </div>
                  );
                }

                // Normal nav icons
                return (
                  <div className="relative" key={idx}>
                    {isActive(item.path) && (
                      <span className="w-10 h-1.5 bg-primary absolute -top-[0.78rem] rounded-b-2xl left-1/2 -translate-x-1/2"></span>
                    )}
                    <div
                      onClick={() => navigate(item.path)}
                      className="flex flex-col justify-center items-center"
                    >
                      <Icon className={`cursor-pointer transition-colors`} />
                      <p className="text-xs">{item.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </nav>
        )}
      </main>
    </div>
  );
};

export default PageLayout;

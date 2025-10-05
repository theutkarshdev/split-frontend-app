import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useAppContext } from "@/hooks/useAppContext";
import CustomCard from "./CustomCard";

export function ModeSwitch() {
  const { theme, setTheme } = useAppContext();
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemPrefersDark(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  const isDark = theme === "dark" || (theme === "system" && systemPrefersDark);

  return (
    <CustomCard radius={12} className="p-3 flex justify-between items-center">
      <div className="text-sm font-normal flex gap-2 items-center">
        <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-600 rounded-full text-primary grid place-content-center">
          {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
        </div>
        <p className="text-sm font-medium">App Theme</p>
      </div>

      <Switch
        checked={isDark}
        onCheckedChange={
          (checked) => setTheme(checked ? "dark" : "light") // explicitly set, no more "system" here
        }
      />
    </CustomCard>
  );
}

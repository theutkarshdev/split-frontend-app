import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useAppContext } from "@/hooks/useAppContext";

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
    <div className="flex justify-between items-center py-2.5">
      <div className="flex items-center gap-3">
        <div className="size-8.5 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500 grid place-content-center shrink-0">
          {isDark ? <Moon className="size-4.5" /> : <Sun className="size-4.5" />}
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground">App Appearance</p>
          <p className="text-[10px] text-muted-foreground">
            {isDark ? "Dark obsidian mode" : "Light porcelain mode"}
          </p>
        </div>
      </div>

      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      />
    </div>
  );
}

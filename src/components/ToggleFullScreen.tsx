import { useState, useEffect } from "react";
import { Maximize, Minimize } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function FullscreenToggle() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);

    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);

    return () => {
      document.removeEventListener("fullscreenchange", onChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  if (isIOS) return null;

  return (
    <div className="flex justify-between items-center py-2.5">
      <div className="flex items-center gap-3">
        <div className="size-8.5 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-500 grid place-content-center shrink-0">
          {isFullscreen ? (
            <Minimize className="size-4.5" />
          ) : (
            <Maximize className="size-4.5" />
          )}
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground">Full Screen</p>
          <p className="text-[10px] text-muted-foreground">
            {isFullscreen ? "Expanded view" : "Standard view"}
          </p>
        </div>
      </div>

      <Switch checked={isFullscreen} onCheckedChange={toggleFullscreen} />
    </div>
  );
}

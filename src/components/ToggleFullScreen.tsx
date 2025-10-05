import { useState, useEffect } from "react";
import { Maximize, Minimize } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import CustomCard from "./CustomCard";

export default function FullscreenToggle() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // ✅ Detect iOS
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

  // 🔒 Hide button on iOS
  if (isIOS) return null;

  return (
    <CustomCard radius={12} className="p-3 flex justify-between items-center">
      <div className="text-sm font-normal flex gap-2 items-center">
        <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-600 rounded-full text-primary grid place-content-center">
          {isFullscreen ? (
            <Minimize className="size-4" />
          ) : (
            <Maximize className="size-4" />
          )}
        </div>
        <p className="text-sm font-medium">Fullscreen</p>
      </div>

      <Switch checked={isFullscreen} onCheckedChange={toggleFullscreen} />
    </CustomCard>
  );
}

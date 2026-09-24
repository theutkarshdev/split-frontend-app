import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CustomCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  pClassName?: string;
  radius?: number;
  glass?: boolean;
  hoverEffect?: boolean;
}

const CustomCard: React.FC<CustomCardProps> = ({
  children,
  className,
  pClassName,
  radius = 16,
  glass = false,
  hoverEffect = false,
  style,
  ...rest
}) => {
  return (
    <div
      style={{
        borderRadius: `${radius}px`,
        ...style,
      }}
      className={cn(
        "text-card-foreground border border-border/80 dark:border-white/[0.08] shadow-xs transition-all duration-200",
        glass ? "glass" : "bg-card",
        hoverEffect && "hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5",
        pClassName,
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export default CustomCard;

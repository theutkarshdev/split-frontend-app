import { Squircle } from "@squircle-js/react";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CustomCardProps {
  children: ReactNode;
  className?: string;
  pClassName?: string;
  radius?: number;
}

const CustomCard: React.FC<CustomCardProps> = ({
  children,
  className,
  pClassName,
  radius = 10,
  ...rest
}) => {
  return (
    <Squircle
      cornerRadius={radius + 1}
      cornerSmoothing={1}
      className={cn("bg-input p-[1.5px]", pClassName)}
      {...rest}
    >
      <Squircle
        cornerRadius={radius}
        cornerSmoothing={1}
        className={cn("bg-card", className)}
      >
        {children}
      </Squircle>
    </Squircle>
  );
};

export default CustomCard;

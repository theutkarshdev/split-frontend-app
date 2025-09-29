import { Squircle } from "@squircle-js/react";
import { type ReactNode } from "react";

interface CustomCardProps {
  children: ReactNode;
  className?: string;
  radius?: number;
}

const CustomCard: React.FC<CustomCardProps> = ({
  children,
  className,
  radius = 10,
  ...rest
}) => {
  return (
    <Squircle
      cornerRadius={radius + 1}
      cornerSmoothing={1}
      className="bg-border p-[1.5px]"
      {...rest}
    >
      <Squircle cornerRadius={radius} cornerSmoothing={1} className={className}>
        {children}
      </Squircle>
    </Squircle>
  );
};

export default CustomCard;

import { ArrowLeftIcon } from "lucide-react";
import { type ReactNode } from "react";
import { useSmartBack } from "@/hooks/useSmartBack";

interface PageHeaderProps {
  title: string | ReactNode;
  rightElement?: ReactNode;
}

const PageHeader = ({ title, rightElement }: PageHeaderProps) => {
  const smartBack = useSmartBack();

  const renderTitle = () => {
    if (typeof title === "string") {
      return <h1 className="text-md font-medium grow">{title}</h1>;
    }
    return <div className="grow">{title}</div>;
  };

  return (
    <div className="border-b pb-3 flex gap-3 p-5 items-center bg-card z-10">
      <ArrowLeftIcon
        className="cursor-pointer"
        onClick={smartBack} // <-- Navigate back
      />
      {renderTitle()}
      {rightElement && <div>{rightElement}</div>}
    </div>
  );
};

export default PageHeader;

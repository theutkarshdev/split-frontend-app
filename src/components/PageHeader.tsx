import { ArrowLeftIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { type ReactNode } from "react";

interface PageHeaderProps {
  title: string | ReactNode;
}

const PageHeader = ({ title }: PageHeaderProps) => {
  const navigate = useNavigate();

  const renderTitle = () => {
    if (typeof title === "string") {
      return <h1 className="text-xl font-semibold grow">{title}</h1>;
    }
    return <div className="grow">{title}</div>;
  };

  return (
    <div className="border-b pb-3 flex gap-3 p-5 items-center sticky top-0 bg-card z-10">
      <ArrowLeftIcon
        className="cursor-pointer"
        onClick={() => navigate(-1)} // <-- Navigate back
      />
      {renderTitle()}
    </div>
  );
};

export default PageHeader;

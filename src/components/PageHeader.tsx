import { ArrowLeftIcon } from "lucide-react";
import { useNavigate } from "react-router";

interface PageHeaderProps {
  title: string;
}

const PageHeader = ({ title }: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="border-b mb-5 pb-3 flex gap-3 p-5 items-center">
      <ArrowLeftIcon
        className="cursor-pointer"
        onClick={() => navigate(-1)} // <-- Navigate back
      />
      <h1 className="text-xl font-semibold grow">{title}</h1>
    </div>
  );
};

export default PageHeader;

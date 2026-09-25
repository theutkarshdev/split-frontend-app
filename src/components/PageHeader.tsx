import { ArrowLeft } from "lucide-react";
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
      return (
        <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate grow">
          {title}
        </h1>
      );
    }
    return <div className="grow overflow-hidden">{title}</div>;
  };

  return (
    <div className="w-full flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0 grow">
        <button
          type="button"
          onClick={smartBack}
          className="size-10 -ml-1 rounded-xl text-foreground/80 hover:text-foreground hover:bg-muted active:scale-95 transition-all flex items-center justify-center shrink-0 cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="size-5" />
        </button>
        {renderTitle()}
      </div>
      {rightElement && <div className="shrink-0 flex items-center gap-2">{rightElement}</div>}
    </div>
  );
};

export default PageHeader;

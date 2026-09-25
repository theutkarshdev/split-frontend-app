import NoDataImg from "@/assets/no-data.webp";
import CustomCard from "./CustomCard";

interface NoDataFoundProps {
  errorMsg?: string | null;
  isBorder?: boolean;
}

const NoDataFound = ({ errorMsg, isBorder = true }: NoDataFoundProps) => {
  return (
    <CustomCard
      pClassName={isBorder ? "" : "p-0 border-none shadow-none bg-transparent"}
      radius={20}
      className={isBorder ? "p-6" : "p-4 bg-transparent border-none shadow-none"}
    >
      <div className="text-center space-y-2 py-4">
        <img
          className="w-44 mx-auto opacity-90 drop-shadow-sm select-none"
          src={NoDataImg}
          alt="No data found"
        />
        <h4 className="text-sm font-bold text-foreground">
          {errorMsg ? errorMsg : "No records found"}
        </h4>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
          Try adjusting your search filters or check back later.
        </p>
      </div>
    </CustomCard>
  );
};

export default NoDataFound;

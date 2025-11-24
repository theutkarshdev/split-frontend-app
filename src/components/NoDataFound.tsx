import NoDataImg from "@/assets/no-data.webp";
import CustomCard from "./CustomCard";

interface NoDataFoundProps {
  errorMsg?: string | null;
  isBorder?: boolean;
}
const NoDataFound = ({ errorMsg, isBorder = true }: NoDataFoundProps) => {
  return (
    <CustomCard pClassName={isBorder ? "" : "p-0"} radius={18}>
      <div className="text-sm text-gray-500 p-5 pb-14 text-center bg-card">
        <img className="w-52 mx-auto" src={NoDataImg} />
        <h5 className="text-xl mb-1">
          {errorMsg ? errorMsg : "No results found"}
        </h5>
        <p>Try different keywords or remove search filters</p>
      </div>
    </CustomCard>
  );
};

export default NoDataFound;

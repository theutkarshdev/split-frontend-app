import NoDataImg from "@/assets/no-data.png";

interface NoDataFoundProps {
  errorMsg: string | null;
}
const NoDataFound = ({ errorMsg }: NoDataFoundProps) => {
  return (
    <div className="text-sm text-gray-500 p-5 pb-14 text-center bg-card">
      <img className="w-52 mx-auto" src={NoDataImg} />
      <h5 className="text-xl mb-1">No results found</h5>
      <p>
        {errorMsg
          ? errorMsg
          : "Try different keywords or remove search filters"}
      </p>
    </div>
  );
};

export default NoDataFound;

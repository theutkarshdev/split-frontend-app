import CustomCard from "@/components/CustomCard";
import PageLayout from "@/components/PageLayout";

const ActivityDetail = () => {
  return (
    <PageLayout title="Activity Details" isNav={false}>
      <div className="space-y-5">
        <CustomCard radius={19} className="p-5">
          <h2 className="text-sm font-bold mb-1">Amount</h2>
          <p className="text-2xl font-bold mb-3">₹ 500</p>

          <p className="text-sm mb-3">Note: Pizza Party</p>
        </CustomCard>

        <CustomCard radius={19} className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold mb-1">To</h2>
              <p className="text-md font-bold">Utkarsh Kushwaha</p>
              <p className="text-xs leading-6 font-normal">
                UPI ID: paytm@byl234
              </p>
            </div>
            <img
              className="size-12 object-cover rounded-full border"
              src="https://img.freepik.com/free-vector/man-profile-account-picture_24908-81754.jpg"
              alt=""
            />
          </div>
          <div className="flex text-sm font-normal gap-2 pt-1 pb-5">
            <button className="border text-xs font-normal px-3 py-2 rounded-sm cursor-pointer">
              View History
            </button>
          </div>
          <hr />
          <div className="pt-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold mb-1">From</h2>
              <p className="text-md font-bold">Pinku Rathour So Nokhelal</p>
              <p className="text-xs leading-6 font-normal">
                UPI ID: paytm@@pthdfc
              </p>
              <p className="text-xs leading-6 font-normal">
                Bank Of Baroda - 4908
              </p>
            </div>
            <img
              className="size-12 object-cover rounded-full border"
              src="https://img.freepik.com/free-vector/man-profile-account-picture_24908-81754.jpg"
              alt=""
            />
          </div>
          <div>
            <p className="text-xs leading-6 font-normal">
              Paid at 10:36 PM, 05 Oct 2025
            </p>
            <p className="text-xs leading-6 font-normal">
              UPI Ref No: 527812900042
            </p>
          </div>
        </CustomCard>

        <CustomCard radius={19} className="p-5">
          <h2 className="text-sm font-bold mb-3">Reciept Image:</h2>
          <CustomCard radius={19}>
            <img
              className="size-full object-cover"
              src="https://media.istockphoto.com/id/889405434/vector/realistic-paper-shop-receipt-vector-cashier-bill-on-white-background.jpg?s=612x612&w=0&k=20&c=M2GxEKh9YJX2W3q76ugKW23JRVrm0aZ5ZwCZwUMBgAg="
              alt=""
            />
          </CustomCard>
        </CustomCard>
      </div>
    </PageLayout>
  );
};

export default ActivityDetail;

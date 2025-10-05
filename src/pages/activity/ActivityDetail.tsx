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

        <CustomCard radius={19} className="p-5 h-72">
          <h2 className="text-sm font-bold mb-1">Paid at</h2>
          <p className="text-sm">04:30 PM, 01 Oct 2025</p>
        </CustomCard>
      </div>
    </PageLayout>
  );
};

export default ActivityDetail;

import PageHeader from "@/components/PageHeader";
import { useParams } from "react-router";
import AvtarImg from "@/assets/Profile_avatar_placeholder_large.png";
import { Button } from "@/components/ui/button";
import { CheckIcon, XIcon } from "lucide-react";

import AddActivityForm from "@/components/AddActivity";

// Minimal realistic transaction data
const transactions = {
  finalAmount: "-3500",
  data: [
    {
      id: "txn-3423etet-3324-sff-2332",
      type: "owed",
      amount: 5000,
      totalAmount: 10000,
      created_at: "2025-09-24T10:29:00.000Z",
      updated_at: "2025-09-24T10:30:00.000Z",
      isAccepted: true,
      note: "Dinner at Barbeque Nation",
      attachment:
        "https://media-cdn.tripadvisor.com/media/photo-s/15/53/1e/b9/food-bill.jpg",
    },
    {
      id: "txn-1234abcd-5678-efgh-9012",
      type: "paid",
      amount: 3000,
      totalAmount: 3000,
      created_at: "2025-09-24T11:00:00.000Z",
      updated_at: "2025-09-24T11:05:00.000Z",
      isAccepted: true,
      note: "Movie tickets",
      attachment:
        "https://media-cdn.tripadvisor.com/media/photo-s/15/53/1e/b9/food-bill.jpg",
    },
    {
      id: "txn-5678ijkl-9012-mnop-3456",
      type: "owed",
      amount: 1500,
      totalAmount: 2000,
      created_at: "2025-09-24T12:15:00.000Z",
      updated_at: "2025-09-24T12:20:00.000Z",
      isAccepted: false,
      note: "Cab fare",
      attachment:
        "https://media-cdn.tripadvisor.com/media/photo-s/15/53/1e/b9/food-bill.jpg",
    },
  ],
  limit: 10,
  page: 1,
  total: 500,
};

interface ActivityProps {
  type: "paid" | "owed";
  amount: number;
  totalAmount: number;
  created_at: string;
  isAccepted: boolean;
  note?: string;
  attachment?: string;
}

const ActivityCard: React.FC<ActivityProps> = ({
  type,
  amount,
  totalAmount,
  created_at,
  isAccepted,
  note,
  attachment,
}) => {
  const isOwed = type === "owed";

  const formattedTime = new Date(created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`max-w-4/5 md:max-w-72 w-full rounded-xl border shadow p-3 mb-3 border-b-4 ${
        isOwed
          ? "bg-white border-b-red-400"
          : "bg-slate -100 ml-auto border-b-green-400"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold">₹{amount.toLocaleString()}</span>
        {isAccepted ? (
          <span className="text-green-600 text-sm">✔ Accepted</span>
        ) : (
          <span className="text-yellow-600 text-sm">⏳ Pending</span>
        )}
      </div>
      <div className="text-gray-700 text-sm mt-1">{note}</div>
      {attachment && (
        <div className="mt-2">
          <img
            src={attachment}
            alt="attachment"
            className="w-full h-32 object-cover rounded"
          />
        </div>
      )}
      {!isAccepted && (
        <div className="flex [&_button]:grow gap-3 my-3">
          <Button variant="outline">
            <XIcon />
            Reject
          </Button>
          <Button>
            <CheckIcon />
            Accept
          </Button>
        </div>
      )}
      <div className="text-xs text-gray-500 mt-2 text-right">
        Total: ₹{totalAmount.toLocaleString()} | {formattedTime}
      </div>
    </div>
  );
};

const UserActivity = () => {
  const { id } = useParams();

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={
          <div className="flex gap-2 items-center">
            <img
              className="w-10 h-10 aspect-square object-cover rounded-full"
              src={AvtarImg}
              loading="lazy"
            />
            <div className="grow overflow-hidden">
              <h3 className="text-md font-medium truncate">theutkarshdev</h3>
              <p className="text-xs capitalize opacity-65 truncate">
                Utkarsh Kushwaha
              </p>
            </div>
          </div>
        }
      />
      <div className="p-5 bg-gray-50 grow flex flex-col overflow-auto">
        {transactions.data.map((txn) => (
          <ActivityCard
            key={txn.id}
            type={txn.type as "paid" | "owed"}
            amount={txn.amount}
            totalAmount={txn.totalAmount}
            created_at={txn.created_at}
            isAccepted={txn.isAccepted}
            note={txn.note}
            attachment={txn.attachment}
          />
        ))}
      </div>

      <div className="px-5 border-t py-5 w-full bg-card flex items-center">
        <p className="text-lg font-bold grow">
          You Owed: <span className="text-red-500">3,500</span>
        </p>
        <AddActivityForm/>
      </div>
    </div>
  );
};

export default UserActivity;

import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import {
  CheckCircle2Icon,
  ChevronRight,
  EditIcon,
  InfoIcon,
  LogInIcon,
  PersonStandingIcon,
  SettingsIcon,
  WalletCardsIcon,
} from "lucide-react";
import { Squircle } from "@squircle-js/react";
import { useNavigate } from "react-router";
import { useAppContext } from "@/hooks/useAppContext";
import PageHeader from "@/components/PageHeader";
import AvtarImg from "@/assets/Profile_avatar_placeholder_large.png";

interface UserData {
  full_name: string;
  id: string;
  email: string;
  username: string;
  profile_pic: string;
  upi_id: string;
  role: string;
  is_verified: boolean;
  created_at: Date;
}

function UserProfile() {
  const navigate = useNavigate();
  const { logout } = useAppContext();
  const [userData, setUserData] = useState<UserData | null>(null);

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const moreDetails = [
    {
      icons: <InfoIcon className="size-4 text-zinc-700" />,
      name: "My Friends",
      click: () => navigate("/search?friend_filter=friends"),
    },
    {
      icons: <EditIcon className="size-4 text-zinc-700" />,
      name: "Invitation Manager",
      click: () => navigate("invitation-manager"),
    },
    {
      icons: <InfoIcon className="size-4 text-zinc-700" />,
      name: "Report a safety emergency",
    },
    {
      icons: <PersonStandingIcon className="size-4 text-zinc-700" />,
      name: "Accessibility",
    },
    {
      icons: <SettingsIcon className="size-4 text-zinc-700" />,
      name: "Settings",
    },
    {
      icons: <LogInIcon className="size-4 text-zinc-700" />,
      name: "Logout",
      click: handleLogout,
    },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get<UserData>("/profile/me");
        if (res.status === 200) {
          setUserData(res.data);
        }
      } catch (error) {
        const err = error as AxiosError<{ message?: string }>;
        console.error(
          "Profile fetch failed:",
          err.response?.data?.message || err.message
        );
      }
    };

    fetchProfile();
  }, []);

  return (
    <div>
      <PageHeader title="My Profile" />
      <div className="px-5">
        <Squircle
          cornerRadius={20}
          cornerSmoothing={1}
          className="bg-zinc-100 p-5 rounded-xl flex items-center gap-3"
        >
          <div>
            <img
              src={userData?.profile_pic || AvtarImg}
              alt="profile pic"
              className="aspect-square object-cover rounded-full w-20"
            />
          </div>
          <div>
            <span className="text-xs font-medium bg-primary text-white mb-1 px-2 py-1 rounded-full inline-flex gap-2">
              {userData?.username} <CheckCircle2Icon className="size-4" />
            </span>
            <p className="text-md font-semibold">{userData?.full_name}</p>
            <p className="text-xs font-medium">{userData?.email}</p>
          </div>
        </Squircle>
        <Squircle
          cornerRadius={10}
          cornerSmoothing={1}
          className="bg-zinc-100 p-3 mt-4"
        >
          <div className="text-sm  font-normal flex gap-2 items-center">
            <div className="size-8 bg-zinc-200 rounded-full text-primary grid place-content-center">
              <WalletCardsIcon className="size-4 " />
            </div>
            {userData?.upi_id}
          </div>
        </Squircle>

        <Squircle
          cornerRadius={10}
          cornerSmoothing={1}
          className="bg-zinc-100 p-3 mt-4 relative"
        >
          <div className="absolute left-0 top-3">
            <span className="text-md font-semibold border-primary text-zinc-700 border-l-3 p-1 pl-2">
              More
            </span>
          </div>
          <div className="pt-10">
            {moreDetails.map((items, index) => (
              <div key={index} className="pb-4">
                <div className="text-sm  font-normal flex gap-2 items-center">
                  <div className="w-9 h-8 bg-zinc-200 rounded-full text-primary grid place-content-center">
                    {items.icons}
                  </div>
                  <button
                    onClick={items.click}
                    className="flex cursor-pointer justify-between itmes-center w-full border-b pb-2 pt-2"
                  >
                    <p className="text-sm font-medium text-zinc-700">
                      {items.name}
                    </p>
                    <ChevronRight className="size-4 text-zinc-700" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Squircle>
      </div>
    </div>
  );
}

export default UserProfile;

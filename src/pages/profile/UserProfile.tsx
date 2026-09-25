import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import {
  BadgeCheck,
  ChevronRight,
  Copy,
  Edit2,
  HelpCircle,
  History,
  LogOut,
  Mail,
  ShieldCheck,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useAppContext } from "@/hooks/useAppContext";
import AvtarImg from "@/assets/Profile_avatar_placeholder_large.png";
import CustomCard from "@/components/CustomCard";
import PageLayout from "@/components/PageLayout";
import { ModeSwitch } from "@/components/ModeToggle";
import FullscreenToggle from "@/components/ToggleFullScreen";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ReportIssue from "./ReportIssue";
import toast from "react-hot-toast";

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
  const [loading, setLoading] = useState(true);
  const [showReportDrawer, setShowReportDrawer] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

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
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const copyUpiId = (upi_id: string) => {
    if (upi_id) {
      navigator.clipboard.writeText(upi_id);
      setCopied(true);
      toast.success("UPI ID copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("No UPI ID configured.");
    }
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  return (
    <PageLayout
      title="Account Settings"
      className="pt-6 sm:pt-8 lg:pt-8 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto space-y-6"
    >
      {/* 2-Column Responsive Layout on Laptop / Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Identity & Digital Cards) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Executive Profile Card */}
          <CustomCard radius={22} className="overflow-hidden border border-border/80 shadow-md">
            {/* Decorative Neutral Banner */}
            <div className="h-24 sm:h-28 bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 dark:from-neutral-800 dark:via-neutral-750 dark:to-neutral-800 relative" />

            <div className="px-5 pb-4 flex items-start justify-between gap-4">
              <div className="relative -mt-12 sm:-mt-14 shrink-0">
                {loading ? (
                  <Skeleton className="size-22 sm:size-24 rounded-full ring-4 ring-card" />
                ) : (
                  <img
                    src={userData?.profile_pic || AvtarImg}
                    alt="Profile"
                    className="size-22 sm:size-24 object-cover rounded-full ring-4 ring-card bg-card shadow-md"
                  />
                )}
                <span className="absolute bottom-1 right-1 size-4 rounded-full bg-emerald-500 ring-2 ring-card" />
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("edit")}
                className="mt-3.5 sm:mt-4 rounded-xl text-xs sm:text-sm font-semibold h-9 sm:h-10 px-4 border border-border/80 dark:border-white/[0.12] bg-card text-foreground hover:bg-muted/80 hover:border-foreground/30 hover:shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <Edit2 className="size-3.5 text-foreground shrink-0" />
                <span>Edit Profile</span>
              </Button>
            </div>

            <div className="px-5 pb-5 space-y-1">
              {loading ? (
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-36 rounded" />
                  <Skeleton className="h-3.5 w-24 rounded" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-xl font-bold text-foreground">
                      {userData?.full_name || "User"}
                    </h2>
                    <BadgeCheck className="size-5 text-primary shrink-0" />
                  </div>

                  <p className="text-xs text-muted-foreground font-mono">
                    @{userData?.username || "username"}
                  </p>

                  {userData?.email && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1.5">
                      <Mail className="size-3.5" />
                      <span className="truncate">{userData.email}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </CustomCard>

          {/* Digital UPI ID Card */}
          <CustomCard
            radius={20}
            className="p-5 border border-border/80 bg-card shadow-xs relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-muted text-foreground grid place-content-center shrink-0">
                  <Wallet className="size-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    Payment Handle (UPI ID)
                  </span>
                  <p className="text-sm font-semibold font-mono text-foreground tracking-wide mt-0.5">
                    {loading ? (
                      <Skeleton className="h-4 w-36 rounded" />
                    ) : (
                      userData?.upi_id || "No UPI ID set"
                    )}
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyUpiId(userData?.upi_id || "")}
                className="size-9 p-0 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Copy UPI ID"
              >
                <Copy className={`size-4 ${copied ? "text-emerald-500" : ""}`} />
              </Button>
            </div>
          </CustomCard>

          {/* Trust Badge */}
          <div className="text-center py-2 space-y-0.5">
            <p className="text-[11px] font-semibold text-foreground/75 flex items-center justify-center gap-1">
              <ShieldCheck className="size-3.5 text-primary" /> Spilly Verified Financial Ledger
            </p>
          </div>
        </div>

        {/* Right Column (Settings Groups on Desktop) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Preferences */}
          <CustomCard radius={20} className="p-5 space-y-2 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Appearance & Experience
            </h3>
            <ModeSwitch />
            <div className="h-px bg-border/60" />
            <FullscreenToggle />
          </CustomCard>

          {/* Connections & Activities */}
          <CustomCard radius={20} className="p-5 space-y-1 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Connections & History
            </h3>

            {/* My Friends */}
            <button
              type="button"
              onClick={() => navigate("/search?friend_filter=friends")}
              className="w-full flex items-center justify-between py-3 hover:bg-muted/40 px-3 rounded-xl transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 grid place-content-center">
                  <Users className="size-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">My Friends</p>
                  <p className="text-xs text-muted-foreground">
                    Manage your friend list, invite contacts & view balances
                  </p>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>

            <div className="h-px bg-border/60" />

            {/* Invitation Manager */}
            <button
              type="button"
              onClick={() => navigate("invitation-manager")}
              className="w-full flex items-center justify-between py-3 hover:bg-muted/40 px-3 rounded-xl transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-primary/10 text-primary grid place-content-center">
                  <UserCheck className="size-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Invitation Manager
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Review incoming and outgoing friend requests
                  </p>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>

            <div className="h-px bg-border/60" />

            {/* My History */}
            <button
              type="button"
              onClick={() => navigate("history")}
              className="w-full flex items-center justify-between py-3 hover:bg-muted/40 px-3 rounded-xl transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 grid place-content-center">
                  <History className="size-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Expense History
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Complete archive of all your settlements and splits
                  </p>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          </CustomCard>

          {/* Support & Security */}
          <CustomCard radius={20} className="p-5 space-y-1 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Support & Account
            </h3>

            {/* Report an Issue */}
            <button
              type="button"
              onClick={() => setShowReportDrawer(true)}
              className="w-full flex items-center justify-between py-3 hover:bg-muted/40 px-3 rounded-xl transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-rose-500/10 text-rose-500 grid place-content-center">
                  <HelpCircle className="size-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Report an Issue
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Submit bug reports, feature requests or get support
                  </p>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>

            <div className="h-px bg-border/60" />

            {/* Logout */}
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center justify-between py-3 hover:bg-rose-500/10 px-3 rounded-xl transition-colors cursor-pointer text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-rose-500/10 text-rose-500 grid place-content-center group-hover:bg-rose-500/20">
                  <LogOut className="size-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-rose-500">Sign Out</p>
                  <p className="text-xs text-muted-foreground">
                    Log out of your current session on this device
                  </p>
                </div>
              </div>
              <ChevronRight className="size-4 text-rose-500/70" />
            </button>
          </CustomCard>
        </div>
      </div>

      {showReportDrawer && (
        <ReportIssue
          showReportDrawer={showReportDrawer}
          setShowReportDrawer={setShowReportDrawer}
        />
      )}

      {/* Logout Dialog */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="max-w-xs p-5 bg-card border rounded-2xl">
          <DialogHeader className="text-left space-y-1.5">
            <DialogTitle className="text-base font-bold">Sign Out</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to log out of your Spilly account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1 rounded-xl text-xs h-10 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={confirmLogout}
              className="flex-1 rounded-xl text-xs h-10 cursor-pointer"
            >
              Log Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}

export default UserProfile;

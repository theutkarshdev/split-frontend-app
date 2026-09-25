import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAppContext } from "@/hooks/useAppContext";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import type { LoginResponse } from "@/types/auth";
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Loader2,
  Moon,
  Receipt,
  RotateCcw,
  ShieldCheck,
  Sun,
  Users,
  Zap,
} from "lucide-react";

const FormSchema = z.object({
  otp: z.string().min(6, {
    message: "One-time password must be 6 digits.",
  }),
});

function NewOtpPage() {
  const { otpData, login, setOtpData, theme, setTheme } = useAppContext();
  const isDark = theme === "dark";

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      otp: "",
    },
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  async function handleResendOTP() {
    if (!otpData?.email) return;
    setResending(true);
    try {
      const res = await axios.post<LoginResponse>(
        `${import.meta.env.VITE_BACKEND_URL}/auth/login`,
        { identifier: otpData.email }
      );

      if (res.status === 200) {
        toast.success("New OTP sent to your email!");
        setTimer(60);
        const { otp_id, email } = res.data;
        setOtpData({ otp_id, email });
      } else {
        toast.error("Failed to resend OTP.");
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast.error("Something went wrong while resending OTP.");
    } finally {
      setResending(false);
    }
  }

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const payload = { ...otpData, ...data };
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/verify`,
        payload
      );

      if (res.status === 200) {
        const { access_token, refresh_token, is_new } = res.data;
        login(access_token, refresh_token, is_new);
      }
      toast.success("OTP verified successfully!");
    } catch (error) {
      console.error("error", error);
      toast.error("Invalid or expired OTP code.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!(otpData.email && otpData.otp_id)) {
      navigate("/auth/login", { replace: true });
    }
  }, [otpData, navigate]);

  function maskEmail(email: string | null): string {
    if (!email) return "";
    const atIndex = email.indexOf("@");
    if (atIndex === -1) return email;

    const user = email.slice(0, atIndex);
    const domain = email.slice(atIndex + 1);

    const visibleStart = user.slice(0, 2);
    const visibleEnd = user.slice(-2);
    const masked = "••••";
    return `${visibleStart}${masked}${visibleEnd}@${domain}`;
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:grid lg:grid-cols-12 bg-background text-foreground transition-colors duration-200">
      {/* ========================================================
          LEFT COLUMN: DESKTOP SHOWCASE (Visible on lg and up)
         ======================================================== */}
      <aside className="hidden lg:flex lg:col-span-7 xl:col-span-7 flex-col justify-between p-12 lg:p-14 xl:p-16 bg-neutral-950 dark:bg-[#111113] text-white relative overflow-hidden border-r border-border/40 dark:border-white/[0.08] select-none">
        {/* Ambient background glows & dots */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -left-40 size-[32rem] rounded-full bg-neutral-700/20 blur-[140px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -right-40 size-[32rem] rounded-full bg-neutral-800/20 blur-[140px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"
        />

        {/* Top Header Branding */}
        <header className="relative z-10 flex items-center justify-between">
          <div className="flex items-baseline gap-2.5">
            <span className="text-2xl font-black tracking-tight text-white">
              Spilly
            </span>
            <span className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase">
              Expense Tracker
            </span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-medium text-neutral-300 backdrop-blur-md">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Secure Two-Factor Authentication</span>
          </div>
        </header>

        {/* Center Presentation & Floating Mockups */}
        <div className="relative z-10 my-auto py-10 space-y-8 max-w-xl">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
              Security made simple,{" "}
              <span className="text-neutral-400">no passwords to forget.</span>
            </h2>
            <p className="text-base text-neutral-400 leading-relaxed max-w-lg">
              We protect your shared ledgers with passwordless one-time verification codes delivered directly to your inbox.
            </p>
          </div>

          {/* Interactive Visual Mockup: Expense Breakdown Card */}
          <div className="space-y-3.5">
            <div className="p-5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.07] border border-white/10 backdrop-blur-xl shadow-2xl transition-all duration-300 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-emerald-500/20 text-emerald-400 grid place-content-center shrink-0">
                    <Receipt className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Weekend Goa Trip Villa
                    </h4>
                    <p className="text-xs text-neutral-400">
                      4 members · Split equally
                    </p>
                  </div>
                </div>

                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="size-3" /> Settled
                </span>
              </div>

              <div className="h-px bg-white/10" />

              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider">
                    Total Bill
                  </span>
                  <span className="text-base font-extrabold text-white">
                    ₹18,400
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider">
                    Your Share
                  </span>
                  <span className="text-base font-extrabold text-emerald-400">
                    ₹4,600
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Feature Perks */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <Zap className="size-4 text-amber-400" />
                <p className="text-xs font-bold text-white">Passwordless</p>
                <p className="text-[11px] text-neutral-400 leading-tight">Instant OTP login</p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <Users className="size-4 text-neutral-300" />
                <p className="text-xs font-bold text-white">Mutual Ledgers</p>
                <p className="text-[11px] text-neutral-400 leading-tight">1-on-1 & groups</p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <ShieldCheck className="size-4 text-emerald-400" />
                <p className="text-xs font-bold text-white">Zero Clutter</p>
                <p className="text-[11px] text-neutral-400 leading-tight">Fast settlements</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Guarantee */}
        <footer className="relative z-10 flex items-center justify-between text-xs text-neutral-500 pt-4 border-t border-white/10">
          <span>Clean, ad-free & private expense tracking.</span>
          <span>© {new Date().getFullYear()} Spilly</span>
        </footer>
      </aside>

      {/* ========================================================
          RIGHT COLUMN: OTP VERIFICATION PANEL
         ======================================================== */}
      <main className="flex-1 lg:col-span-5 xl:col-span-5 flex flex-col justify-between min-h-screen p-6 sm:p-10 lg:p-12 xl:p-14 relative bg-background">
        {/* Top Header */}
        <header className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={() => navigate("/auth/login")}
            className="inline-flex items-center gap-2 px-3 py-2 -ml-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all cursor-pointer"
            aria-label="Back to login"
          >
            <ArrowLeft className="size-4" />
            <span>Back</span>
          </button>

          {/* Theme switcher */}
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="size-10 rounded-xl border border-border/80 bg-card hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-xs active:scale-95"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle color theme"
          >
            {isDark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
          </button>
        </header>

        {/* Centered OTP Form */}
        <section className="my-auto py-8 w-full max-w-sm sm:max-w-md mx-auto space-y-7">
          <div className="text-center space-y-2">
            <div className="size-14 rounded-2xl bg-muted text-foreground grid place-content-center mx-auto mb-3 shadow-xs">
              <KeyRound className="size-7" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Verification Code
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
              We sent a 6-digit one-time code to
            </p>
            <div className="inline-block px-3.5 py-1.5 rounded-full bg-muted/70 text-xs font-mono font-semibold text-foreground tracking-wider border border-border/80">
              {maskEmail(otpData.email)}
            </div>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <InputOTP maxLength={6} {...field} autoFocus>
                        <InputOTPGroup className="gap-2 sm:gap-2.5 mx-auto justify-center">
                          <InputOTPSlot
                            index={0}
                            className="size-11 sm:size-13 rounded-2xl border border-border/80 text-xl font-extrabold bg-card focus:border-primary shadow-xs"
                          />
                          <InputOTPSlot
                            index={1}
                            className="size-11 sm:size-13 rounded-2xl border border-border/80 text-xl font-extrabold bg-card focus:border-primary shadow-xs"
                          />
                          <InputOTPSlot
                            index={2}
                            className="size-11 sm:size-13 rounded-2xl border border-border/80 text-xl font-extrabold bg-card focus:border-primary shadow-xs"
                          />
                          <InputOTPSlot
                            index={3}
                            className="size-11 sm:size-13 rounded-2xl border border-border/80 text-xl font-extrabold bg-card focus:border-primary shadow-xs"
                          />
                          <InputOTPSlot
                            index={4}
                            className="size-11 sm:size-13 rounded-2xl border border-border/80 text-xl font-extrabold bg-card focus:border-primary shadow-xs"
                          />
                          <InputOTPSlot
                            index={5}
                            className="size-11 sm:size-13 rounded-2xl border border-border/80 text-xl font-extrabold bg-card focus:border-primary shadow-xs"
                          />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage className="text-xs text-center" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-13 sm:h-14 rounded-2xl text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  "Verify & Sign In"
                )}
              </Button>
            </form>
          </Form>

          {/* Resend Code Action */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={timer > 0 || resending}
              className="text-xs sm:text-sm font-semibold text-primary hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer inline-flex items-center gap-2"
            >
              {resending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Resending code...
                </>
              ) : timer > 0 ? (
                `Resend code in ${timer}s`
              ) : (
                <>
                  <RotateCcw className="size-4" /> Resend Code Now
                </>
              )}
            </button>
          </div>
        </section>

        {/* Footer info */}
        <footer className="text-center w-full pt-4">
          <p className="text-xs text-muted-foreground leading-normal max-w-xs sm:max-w-sm mx-auto">
            Didn't receive the email? Check your spam folder or verify that your email address is correct.
          </p>
        </footer>
      </main>
    </div>
  );
}

export default NewOtpPage;

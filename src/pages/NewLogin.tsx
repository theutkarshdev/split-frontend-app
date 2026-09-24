import GoogleLoginButton from "@/components/GoogleLoginButton";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAppContext } from "@/hooks/useAppContext";
import type { LoginResponse } from "@/types/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router";
import { z } from "zod";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Moon,
  Receipt,
  ShieldCheck,
  Sun,
  User,
  Users,
  Zap,
} from "lucide-react";

const FormSchema = z.object({
  identifier: z.string().min(2, {
    message: "Username or email must be at least 2 characters.",
  }),
});

const NewLogin = () => {
  const [loading, setLoading] = useState(false);
  const { theme, setTheme, setOtpData } = useAppContext();
  const isDark = theme === "dark";

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      identifier: "",
    },
  });

  const location = useLocation();
  const navigate = useNavigate();

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true);
    try {
      const res = await axios.post<LoginResponse>(
        `${import.meta.env.VITE_BACKEND_URL}/auth/login`,
        data
      );
      if (res.status === 200) {
        const { otp_id, email } = res.data;
        setOtpData({ otp_id, email });
        toast.success("OTP sent to your email.");
        navigate("/auth/verify-otp", {
          state: { from: location.state?.from },
        });
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error("Account lookup failed. Please try again.");
    } finally {
      setLoading(false);
    }
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
            <span>Smart Bill Splitting</span>
          </div>
        </header>

        {/* Center Presentation & Floating Mockups */}
        <div className="relative z-10 my-auto py-10 space-y-8 max-w-xl">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
              Split expenses with friends,{" "}
              <span className="text-neutral-400">settle with zero friction.</span>
            </h2>
            <p className="text-base text-neutral-400 leading-relaxed max-w-lg">
              The minimal, transparent ledger designed for roommates, dinners,
              trips, and daily shared expenses. No messy spreadsheets or awkward money talks.
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
          RIGHT COLUMN: AUTHENTICATION PANEL
          (Full width on mobile, right column on desktop)
         ======================================================== */}
      <main className="flex-1 lg:col-span-5 xl:col-span-5 flex flex-col justify-between min-h-screen p-6 sm:p-10 lg:p-12 xl:p-14 relative bg-background">
        {/* Top Header on Auth Panel */}
        <header className="flex items-center justify-between w-full">
          {/* Mobile-only logo */}
          <div className="lg:hidden flex items-baseline gap-2 select-none">
            <span className="text-xl font-extrabold tracking-tight text-foreground">
              Spilly
            </span>
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Expense Tracker
            </span>
          </div>

          {/* Desktop spacer */}
          <div className="hidden lg:block" />

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

        {/* Centered Sign In Form */}
        <section className="my-auto py-8 w-full max-w-sm sm:max-w-md mx-auto space-y-7">
          {/* Header Copy */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 border border-border/80 text-[11px] font-semibold text-muted-foreground mb-1">
              <Zap className="size-3 text-primary" />
              <span>Fast & secure login</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Welcome to Spilly
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Enter your username or email address. We'll send you a 6-digit one-time code to sign in instantly.
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                          <User className="size-4.5" />
                        </span>
                        <Input
                          placeholder="Username or email address"
                          autoComplete="username email"
                          autoFocus
                          {...field}
                          className="pl-11 h-13 sm:h-14 rounded-2xl text-base font-medium border-border/80 bg-card focus-visible:ring-primary shadow-xs transition-all placeholder:text-muted-foreground/60"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
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
                    <span>Sending code...</span>
                  </>
                ) : (
                  <>
                    <span>Continue with OTP</span>
                    <ArrowRight className="size-4.5" />
                  </>
                )}
              </Button>
            </form>
          </Form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px bg-border/80 grow" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              OR CONTINUE WITH
            </span>
            <div className="h-px bg-border/80 grow" />
          </div>

          {/* Google Sign-in */}
          <div className="w-full">
            <GoogleLoginButton setLoading={setLoading} />
          </div>

          {/* Passwordless Security Assurance */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-muted/30 border border-border/70 text-xs text-muted-foreground">
            <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="leading-snug">
              No passwords required. We verify your identity with a secure code sent to your email.
            </p>
          </div>
        </section>

        {/* Footer Policy */}
        <footer className="text-center w-full pt-4">
          <p className="text-xs text-muted-foreground leading-normal max-w-xs sm:max-w-sm mx-auto">
            By continuing, you agree to Spilly's{" "}
            <span className="underline cursor-pointer hover:text-foreground">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="underline cursor-pointer hover:text-foreground">
              Privacy Policy
            </span>
            .
          </p>
        </footer>
      </main>
    </div>
  );
};

export default NewLogin;

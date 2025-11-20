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

const FormSchema = z.object({
  otp: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

function NewOtpPage() {
  const { otpData, login, setOtpData } = useAppContext();
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

  // Countdown timer logic
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Resend OTP handler
  async function handleResendOTP() {
    if (!otpData?.email) return;
    setResending(true);
    try {
      const res = await axios.post<LoginResponse>(
        `${import.meta.env.VITE_BACKEND_URL}/auth/login`,
        { identifier: otpData.email }
      );

      if (res.status === 200) {
        toast.success("OTP resent successfully!");
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
        payload,
        {
          withCredentials: true,
        }
      );

      if (res.status === 200) {
        const { access_token, is_new } = res.data;
        login(access_token, is_new);
      }
      toast.success("OTP verified successfully.");
    } catch (error) {
      console.error("error", error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!(otpData.email && otpData.otp_id)) {
      navigate("/auth/login", { replace: true });
    }
  }, []);

  function maskEmail(email: string | null): string {
    if (!email) return ""; // handle null or empty email safely

    const atIndex = email.indexOf("@");
    if (atIndex === -1) return email; // not a valid email, return as-is

    const user = email.slice(0, atIndex);
    const domain = email.slice(atIndex + 1);

    // Show first 2 chars and last 2 chars of the user part
    const visibleStart = user.slice(0, 2);
    const visibleEnd = user.slice(-2);
    const masked = "*****";
    return `${visibleStart}${masked}${visibleEnd}@${domain}`;
  }

  return (
    <div className="bg-foreground">
      <main className="w-full max-w-md h-svh mx-auto relative bg-black overflow-hidden">
        <div className="size-[90svh] absolute -bottom-32 left-1/2 -translate-x-1/2 bg-zinc-200 dark:bg-card rounded-full"></div>
        <div className="size-[80svh] absolute -bottom-32 left-1/2 -translate-x-1/2 bg-zinc-100 dark:bg-zinc-800 rounded-full shadow-2xl"></div>

        <div className="flex flex-col h-svh absolute z-2 w-full p-5">
          <div className="grow text-center text-4xl font-normal pt-14">
            <img className="w-40 mx-auto" src="/logo-search-grid-2x.png" />
          </div>
          <div className="space-y-5">
            <p className="text-sm text-center mb-8 max-w-[80%] mx-auto italic">
              "To confirm your email address, Please enter the OTP we have sent
              to your email:{" "}
              <span className="font-medium masked-email">
                {maskEmail(otpData.email)}"
              </span>
            </p>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full max-w-md flex flex-col gap-5"
              >
                <FormField
                  control={form.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup className="space-x-2 mx-auto">
                            <InputOTPSlot
                              index={0}
                              className="rounded-md border-l size-12"
                            />
                            <InputOTPSlot
                              index={1}
                              className="rounded-md border-l size-12"
                            />
                            <InputOTPSlot
                              index={2}
                              className="rounded-md border-l size-12"
                            />
                            <InputOTPSlot
                              index={3}
                              className="rounded-md border-l size-12"
                            />
                            <InputOTPSlot
                              index={4}
                              className="rounded-md border-l size-12"
                            />
                            <InputOTPSlot
                              index={5}
                              className="rounded-md border-l size-12"
                            />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer px-10 h-12 rounded-lg text-center flex justify-center items-center gap-2 hover:bg-zinc-700 transition duration-200 w-full"
                >
                  {loading ? <>Verifying OTP</> : <>Verify & Sign in</>}
                </Button>
              </form>
            </Form>

            <div className="flex gap-2 items-center w-full">
              <span className="h-[1.6px] min-h-[1.6px] bg-zinc-400 w-full"></span>
              <span className="text-xs uppercase">OR</span>
              <span className="h-[1.6px] min-h-[1.6px] bg-zinc-400 w-full"></span>
            </div>
            <div className="flex justify-center mt-2">
              <Button
                onClick={handleResendOTP}
                disabled={timer > 0 || resending}
              >
                {resending
                  ? "Resending..."
                  : timer > 0
                  ? `Resend OTP in ${timer}s`
                  : "Resend OTP"}
              </Button>
            </div>

            <p className="text-sm text-center">
              By continuing, you agree to our policies.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default NewOtpPage;

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
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

const FormSchema = z.object({
  otp: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

function OtpPage() {
  const { otpData, login } = useAppContext();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      otp: "",
    },
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const payload = { ...otpData, ...data };
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/verify`,
        payload
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
    const masked = "*".repeat(Math.max(user.length - 4, 3)); // at least 3 *

    return `${visibleStart}${masked}${visibleEnd}@${domain}`;
  }

  return (
    <div className="flex gap-20  items-center justify-center h-dvh overflow-hidden relative px-5">
      <div className="flex gap-5 items-center justify-center flex-col w-full max-w-md relative z-10">
        <h3 className="text-4xl font-medium text-center">Spilly</h3>
        <p className="text-sm text-black text-center mb-8 max-w-60 mx-auto italic">
          "With us splitting money is always simple and stress-free."
        </p>
        <p className="text-sm mb-3 mx-auto text-black text-center font-normal">
          To confirm your email address, Please enter the OTP we have sent to
          {""}
          <span className="font-medium masked-email">
            {" "}
            {maskEmail(otpData.email)}
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
                <FormItem className="flex flex-col gap-4">
                  <FormLabel className="mx-auto">One-Time Password</FormLabel>
                  <FormControl className="w-full">
                    <InputOTP className="w-full" maxLength={6} {...field}>
                      <InputOTPGroup className="flex justify-center items-center w-full">
                        <InputOTPSlot
                          index={0}
                          className="block w-full p-3 text-center bg-white text-sm placeholder:text-zinc-800 outline-none h-12 shadow-none outline-0"
                        />
                        <InputOTPSlot
                          index={1}
                          className="block w-full p-3 text-center bg-white text-sm placeholder:text-zinc-800 outline-none h-12 shadow-none outline-0"
                        />
                        <InputOTPSlot
                          index={2}
                          className="block w-full p-3 text-center bg-white text-sm placeholder:text-zinc-800 outline-none h-12 shadow-none outline-0"
                        />
                        <InputOTPSlot
                          index={3}
                          className="block w-full p-3 text-center bg-white text-sm placeholder:text-zinc-800 outline-none h-12 shadow-none outline-0"
                        />
                        <InputOTPSlot
                          index={4}
                          className="block w-full p-3 text-center bg-white text-sm placeholder:text-zinc-800 outline-none h-12 shadow-none outline-0"
                        />
                        <InputOTPSlot
                          index={5}
                          className="block w-full p-3 text-center bg-white text-sm placeholder:text-zinc-800 outline-none h-12 shadow-none outline-0"
                        />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormDescription className="mx-auto text-black">
                    Please enter the one-time password sent to your email.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={loading}
              className="cursor-pointer bg-black text-white py-2 px-10 h-12 rounded-lg text-center flex justify-center items-center gap-2 hover:bg-zinc-700 transition duration-200 w-full"
            >
              {loading ? (
                <>
                  Verifying OTP
                  <i className="bi bi-arrow-repeat inline-block animate-spin text-xl"></i>
                </>
              ) : (
                <>
                  Verify & Sign in <i className="bi bi-check2 text-2xl"></i>
                </>
              )}
            </Button>
          </form>
        </Form>
        <div className="flex justify-center items-center gap-1.5">
          <p className="text-sm text-black text-center">Valid for 10 mins,</p>
          <button
            type="button"
            className="cursor-pointer flex items-center gap-1 text-black text-sm bg-transparent p-0 m-0 border-none outline-none"
          >
            Resend the code
            <i className="bi text-lg leading-0 bi-arrow-counterclockwise"></i>
          </button>
        </div>
      </div>
      <div className="hero--img--anim absolute lg:top-1/3 top-1/2 left-1/2 -translate-1/2 md:w-[50dvw] md:h-[50dvw] w-dvw h-dvw">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
}

export default OtpPage;

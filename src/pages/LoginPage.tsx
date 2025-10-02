import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { useState } from "react";
import type { LoginResponse } from "@/types/auth";
import { useAppContext } from "@/hooks/useAppContext";
import { useNavigate } from "react-router";
import CustomCard from "@/components/CustomCard";

const FormSchema = z.object({
  identifier: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

export function LoginPage() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      identifier: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const { setOtpData } = useAppContext();
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
        toast.success("Otp sent successfully.");
        navigate("/auth/verify-otp");
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-20 items-center justify-center h-dvh relative overflow-hidden px-5 z-2">
      <CustomCard
        radius={25}
        pClassName="w-full max-w-md bg-transparent border"
        className="flex gap-5 items-center justify-center flex-col p-5 backdrop-blur-lg bg-transparent"
      >
        <h3 className="text-4xl font-medium text-center">Spilly</h3>
        <p className="text-sm text-center mb-8 max-w-60 mx-auto italic">
          "Spilly makes it easy to share expenses and settle up with friends
          effortlessly."
        </p>
        <p className="text-base text-center font-normal">
          Log in or sign up here
        </p>
        <button
          type="button"
          className="cursor-pointer bg-black text-white py-3 px-10 rounded-lg text-center flex justify-center items-center gap-2 hover:bg-zinc-700 transition duration-200 mx-auto"
        >
          <i className="bi bi-google"></i> Continue with Google
        </button>
        <div className="flex gap-2 items-center w-full">
          <span className="h-[1.6px] min-h-[1.6px] bg-zinc-400 w-full"></span>
          <span className="text-xs uppercase">OR</span>
          <span className="h-[1.6px] min-h-[1.6px] bg-zinc-400 w-full"></span>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full  flex flex-col gap-5"
          >
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Continue with username or email..."
                      {...field}
                      className="w-full px-4 rounded-lg border-2 h-12 text-sm font-medium outline-none shadow-none bg-card"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={loading}
              className="cursor-pointer !bg-black text-white py-2 px-10 h-12 rounded-lg text-center flex justify-center items-center gap-2 w-full"
            >
              {loading ? <>Sending OTP...</> : <>Get OTP</>}
            </Button>
          </form>
        </Form>
        <p className="text-sm text-center">
          By continuing, you agree to our policies.
        </p>
      </CustomCard>

      <div className="hero--img--anim absolute -z-1 lg:top-1/3 top-1/2 left-1/2 -translate-1/2 md:w-[50dvw] md:h-[50dvw] w-dvw h-dvw [&_span]:bg-[linear-gradient(43deg,#000000_0%,#ffffff_46%,#d4d4d4_100%)] [&_span]:dark:bg-[linear-gradient(43deg,#000000_0%,gray_46%,#d4d4d4_100%)]">
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

export default LoginPage;

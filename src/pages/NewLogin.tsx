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

const FormSchema = z.object({
  identifier: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

const NewLogin = () => {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      identifier: "",
    },
  });


    const { setOtpData } = useAppContext();
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
          toast.success("Otp sent successfully.");
          navigate("/auth/verify-otp", {
            state: { from: location.state?.from },
          });
        }
      } catch (err: unknown) {
        console.error(err);
        toast.error("Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

  return (
    <div className="bg-foreground">
      <main className="w-full max-w-md h-svh mx-auto relative bg-black overflow-hidden">
        <div className="size-[90svh] absolute -bottom-32 left-1/2 -translate-x-1/2 bg-zinc-200 dark:bg-card rounded-full"></div>
        <div className="size-[80svh] absolute -bottom-32 left-1/2 -translate-x-1/2 bg-zinc-100 dark:bg-zinc-800 rounded-full"></div>

        <div className="flex flex-col h-svh absolute z-2 w-full p-5">
          <div className="grow text-center text-4xl font-normal pt-14">
            <img className="w-40 mx-auto" src="/logo-search-grid-2x.png" />
          </div>
          <div className="space-y-5">
            <h3 className="text-3xl text-center hidden">Welcome Back</h3>
            <p className="text-sm text-center mb-8 max-w-60 mx-auto italic">
              "Spilly makes it easy to share expenses and settle up with friends
              effortlessly."
            </p>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-5"
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
                  className="cursor-pointer py-2 px-10 h-12 rounded-lg text-center flex justify-center items-center gap-2 w-full"
                >
                  {loading ? <>Sending OTP...</> : <>Get OTP</>}
                </Button>
              </form>
            </Form>
            <div className="flex gap-2 items-center w-full">
              <span className="h-[1.6px] min-h-[1.6px] bg-zinc-400 w-full"></span>
              <span className="text-xs uppercase">OR</span>
              <span className="h-[1.6px] min-h-[1.6px] bg-zinc-400 w-full"></span>
            </div>
            <GoogleLoginButton setLoading={setLoading} />
            <p className="text-sm text-center">
              By continuing, you agree to our policies.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewLogin;

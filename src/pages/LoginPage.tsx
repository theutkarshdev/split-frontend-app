import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
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
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { useState } from "react";
import type { LoginResponse } from "@/types/auth";
import { useAppContext } from "@/layout/AppContext";
import { useNavigate } from "react-router";

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
        `https://split-backend-app.vercel.app/auth/login`,
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
    <div className="flex items-center justify-center bg-gray-50 h-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full max-w-md flex flex-col gap-4 p-6 bg-white shadow-lg rounded-xl"
        >
          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="shadcn" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Sending Otp..." : "Submit"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default LoginPage;

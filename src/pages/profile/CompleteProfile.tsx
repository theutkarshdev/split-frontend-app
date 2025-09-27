import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useRef, useEffect } from "react";
import axiosInstance from "@/lib/axiosInstance";

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
import { Pencil } from "lucide-react";
import AvtarImg from "@/assets/Profile_avatar_placeholder_large.png";
import toast from "react-hot-toast";
import { useAppContext } from "@/hooks/useAppContext";
import { useNavigate } from "react-router";
import PageHeader from "@/components/PageHeader";

// ✅ Zod Schema
const FormSchema = z.object({
  full_name: z
    .string()
    .min(2, { message: "Full name must be at least 2 characters." }),
  upi_id: z.string().regex(/^[\w.-]+@[\w.-]+$/, {
    message: "Invalid UPI ID format (e.g. name@bank).",
  }),
  profile_pic: z
    .any()
    .refine(
      (file) =>
        file instanceof File ||
        (Array.isArray(file) && file[0] instanceof File),
      { message: "Profile picture is required." }
    )
    .refine((file) => {
      const f = Array.isArray(file) ? file[0] : file;
      return f && ["image/jpeg", "image/png", "image/jpg"].includes(f.type);
    }, "Only JPG or PNG images are allowed."),
  username: z
    .string()
    .regex(/^[a-z0-9_]+$/, {
      message:
        "Username can only include lowercase letters, numbers, and underscores.",
    })
    .min(5, { message: "Username must be at least 2 characters." })
    .max(15, { message: "Username must be at least 15 characters." }),
});

function CompleteProfile() {
  const navigate = useNavigate();
  const { markProfileComplete, auth } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      full_name: "",
      upi_id: "",
      profile_pic: undefined,
      username: "",
    },
  });

  // ✅ Ref for debounce timer
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ✅ Username check (debounced)
  const checkUserName = (value: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!value || value.length < 2) {
      setUsernameAvailable(null);
      return;
    }

    timerRef.current = setTimeout(async () => {
      try {
        const res = await axiosInstance.get("/profile/check-username", {
          params: { username: value },
        });

        if (res.data.available) {
          setUsernameAvailable(true);
          form.clearErrors("username");
        } else {
          setUsernameAvailable(false);
          form.setError("username", {
            type: "manual",
            message: "This username is already taken",
          });
        }
      } catch (error) {
        console.log(error);
        setUsernameAvailable(null);
        form.setError("username", {
          type: "manual",
          message: "Error checking username",
        });
      }
    }, 500); // debounce delay
  };

  // ✅ Submit
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true);
    try {
      // Re-check username before submitting
      const response = await axiosInstance.get("/profile/check-username", {
        params: { username: data.username },
      });

      if (!response.data.available) {
        form.setError("username", {
          type: "manual",
          message: "This username is already taken",
        });
        return;
      }

      const formData = new FormData();
      formData.append("full_name", data.full_name);
      formData.append("upi_id", data.upi_id);
      formData.append("username", data.username);

      if (data.profile_pic instanceof File) {
        formData.append("profile_pic", data.profile_pic);
      }

      const res = await axiosInstance.post("/profile/complete", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.status == 200) {
        form.reset();
        toast.success("Profile completed successfully.");
        markProfileComplete();
        navigate("/");
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!auth.is_new) {
      navigate("/", { replace: true });
    }
  });

  return (
    <div>
      <PageHeader title="Complete Profile" />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 px-5"
          encType="multipart/form-data"
        >
          {/* Profile Picture */}
          <FormField
            control={form.control}
            name="profile_pic"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="w-full bg-slate-100 py-5 rounded-xl">
                    <div className="relative w-[30%] mx-auto">
                      <img
                        src={
                          field.value
                            ? URL.createObjectURL(field.value)
                            : AvtarImg
                        }
                        alt="Profile preview"
                        className="w-full rounded-full object-cover aspect-square"
                      />
                      <label
                        htmlFor="profile_pic_input"
                        className="absolute bottom-0 left-2/3 bg-primary rounded-full cursor-pointer shadow-md"
                      >
                        <Pencil className="size-8 p-2 text-white" />
                      </label>
                    </div>
                    <Input
                      type="file"
                      accept="image/*"
                      id="profile_pic_input"
                      className="hidden"
                      onChange={(e) =>
                        field.onChange(
                          e.target.files ? e.target.files[0] : null
                        )
                      }
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Full Name */}
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* UPI ID */}
          <FormField
            control={form.control}
            name="upi_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>UPI ID</FormLabel>
                <FormControl>
                  <Input placeholder="username@bank" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Username */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    placeholder="user_name"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      checkUserName(e.target.value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Use lowercase letters, numbers, and underscores only.
                </FormDescription>
                {usernameAvailable && (
                  <p className="text-green-600 text-sm">
                    ✅ Username is available
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-10"
            disabled={!!form.formState.errors.username || loading}
          >
            {loading ? "Sending ..." : "Submit"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default CompleteProfile;

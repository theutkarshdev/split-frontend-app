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
import PageLayout from "@/components/PageLayout";
import type { AxiosError } from "axios";

// ✅ User type
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

// ✅ Validation Schema
const FormSchema = z.object({
  full_name: z
    .string()
    .min(2, { message: "Full name must be at least 2 characters." }),
  upi_id: z.string().regex(/^[\w.-]+@[\w.-]+$/, {
    message: "Invalid UPI ID format (e.g. name@bank).",
  }),
  username: z
    .string()
    .regex(/^[a-z0-9_]+$/, {
      message:
        "Username can only include lowercase letters, numbers, and underscores.",
    })
    .min(5, { message: "Username must be at least 5 characters." })
    .max(15, { message: "Username must be at most 15 characters." }),
  profile_pic: z
    .union([z.instanceof(File), z.string().url().optional(), z.undefined()])
    .refine(
      (val) =>
        !val ||
        typeof val === "string" ||
        (val instanceof File &&
          ["image/jpeg", "image/png", "image/jpg"].includes(val.type)),
      {
        message: "Only JPG or PNG images are allowed.",
      }
    ),
});

function EditProfile() {
  const navigate = useNavigate();
  const { markProfileComplete } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [userData, setUserData] = useState<UserData | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      full_name: "",
      upi_id: "",
      username: "",
      profile_pic: undefined,
    },
  });

  // ✅ Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get<UserData>("/profile/me");
        if (res.status === 200) {
          setUserData(res.data);
          form.reset({
            full_name: res.data.full_name || "",
            upi_id: res.data.upi_id || "",
            username: res.data.username || "",
            profile_pic: res.data.profile_pic || undefined,
          });
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
  }, [form]);

  // ✅ Debounced username availability check
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
        console.error(error);
        setUsernameAvailable(null);
        form.setError("username", {
          type: "manual",
          message: "Error checking username",
        });
      }
    }, 500);
  };

  // ✅ Submit handler
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true);
    try {
      if (userData?.username !== data.username) {
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
      }
      const formData = new FormData();
      // Only append if changed
      if (userData?.full_name !== data.full_name) {
        formData.append("full_name", data.full_name);
      }
      if (userData?.upi_id !== data.upi_id) {
        formData.append("upi_id", data.upi_id);
      }
      if (userData?.username !== data.username) {
        formData.append("username", data.username);
      }

      if (data.profile_pic instanceof File) {
        formData.append("profile_pic", data.profile_pic);
      }

      const res = await axiosInstance.put("/profile/edit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 200) {
        toast.success("Profile edit successfully!");
        markProfileComplete();
        navigate("/profile");
      }
    } catch (error) {
      console.error("Profile completion failed:", error);
      toast.error("Error editing profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageLayout title="Edit Profile" isNav={false}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
          encType="multipart/form-data"
        >
          {/* ✅ Profile Picture */}
          <FormField
            control={form.control}
            name="profile_pic"
            render={({ field }) => {
              // dynamically compute preview
              const preview =
                field.value instanceof File
                  ? URL.createObjectURL(field.value)
                  : typeof field.value === "string"
                  ? field.value
                  : userData?.profile_pic || AvtarImg;

              // cleanup URL object
              useEffect(() => {
                if (field.value instanceof File) {
                  const url = URL.createObjectURL(field.value);
                  return () => URL.revokeObjectURL(url);
                }
              }, [field.value]);

              return (
                <FormItem>
                  <FormControl>
                    <div className="w-full bg-card py-5 rounded-xl">
                      <div className="relative w-[30%] mx-auto">
                        <img
                          src={preview}
                          alt="Profile preview"
                          className="w-full rounded-full object-cover aspect-square"
                        />
                        <label
                          htmlFor="profile_pic_input"
                          className="absolute bottom-0 left-2/3 bg-black rounded-full cursor-pointer shadow-md"
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
                          field.onChange(e.target.files?.[0] ?? undefined)
                        }
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          {/* ✅ Full Name */}
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

          {/* ✅ UPI ID */}
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

          {/* ✅ Username */}
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
    </PageLayout>
  );
}

export default EditProfile;

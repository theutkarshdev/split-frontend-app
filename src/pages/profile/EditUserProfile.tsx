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
import { Camera, CheckCircle2, Loader2, User, Wallet, XCircle } from "lucide-react";
import AvtarImg from "@/assets/Profile_avatar_placeholder_large.png";
import toast from "react-hot-toast";
import { useAppContext } from "@/hooks/useAppContext";
import { useNavigate } from "react-router";
import PageLayout from "@/components/PageLayout";
import CustomCard from "@/components/CustomCard";

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
    .min(3, { message: "Username must be at least 3 characters." })
    .max(20, { message: "Username must be at most 20 characters." }),
  profile_pic: z
    .union([z.instanceof(File), z.string().url().optional(), z.undefined()])
    .refine(
      (val) =>
        !val ||
        typeof val === "string" ||
        (val instanceof File &&
          ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(val.type)),
      {
        message: "Only JPG, PNG or WEBP images are allowed.",
      }
    ),
});

function EditUserProfile() {
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
        console.error("Failed to load profile:", error);
      }
    };

    fetchProfile();
  }, [form]);

  const handleUsernameChange = (value: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (userData && value === userData.username) {
      setUsernameAvailable(true);
      form.clearErrors("username");
      return;
    }

    if (value.length < 3) {
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
      }
    }, 400);
  };

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
          setLoading(false);
          return;
        }
      }

      const formData = new FormData();
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
        toast.success("Profile updated successfully!");
        markProfileComplete();
        navigate("/profile");
      }
    } catch (error) {
      console.error("Profile edit failed:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageLayout
      title="Edit Profile"
      isNav={false}
      className="pt-6 sm:pt-8 lg:pt-8 px-4 sm:px-6 lg:px-8 pb-12 max-w-xl mx-auto space-y-6"
    >
      <CustomCard radius={22} className="p-5 border border-border/80 shadow-md">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
            encType="multipart/form-data"
          >
            {/* Avatar Upload */}
            <FormField
              control={form.control}
              name="profile_pic"
              render={({ field }) => {
                const preview =
                  field.value instanceof File
                    ? URL.createObjectURL(field.value)
                    : typeof field.value === "string"
                    ? field.value
                    : userData?.profile_pic || AvtarImg;

                useEffect(() => {
                  if (field.value instanceof File) {
                    const url = URL.createObjectURL(field.value);
                    return () => URL.revokeObjectURL(url);
                  }
                }, [field.value]);

                return (
                  <FormItem className="text-center">
                    <FormControl>
                      <div className="relative size-24 mx-auto my-2 group">
                        <img
                          src={preview}
                          alt="Profile preview"
                          className="size-full rounded-full object-cover ring-4 ring-primary/20 shadow-md"
                        />
                        <label
                          htmlFor="profile_pic_edit"
                          className="absolute bottom-0 right-0 size-8 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-all"
                          aria-label="Change photo"
                        >
                          <Camera className="size-4" />
                        </label>
                        <Input
                          type="file"
                          accept="image/*"
                          id="profile_pic_edit"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) field.onChange(file);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-[11px] text-muted-foreground">
                      Tap the camera icon to update your profile photo
                    </FormDescription>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                );
              }}
            />

            {/* Full Name */}
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-foreground">
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        placeholder="Your full name"
                        {...field}
                        className="pl-10 h-11 rounded-xl text-sm font-medium border-border/80 bg-muted/30 focus-visible:ring-primary"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* Username */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-foreground">
                    Username
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                        @
                      </span>
                      <Input
                        placeholder="username"
                        {...field}
                        className="pl-8 pr-10 h-12 rounded-xl text-sm font-medium border-border/80 bg-muted/30 focus-visible:ring-primary font-mono"
                        onChange={(e) => {
                          const val = e.target.value.toLowerCase().trim();
                          field.onChange(val);
                          handleUsernameChange(val);
                        }}
                      />
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        {usernameAvailable === true && (
                          <CheckCircle2 className="size-4 text-emerald-500" />
                        )}
                        {usernameAvailable === false && (
                          <XCircle className="size-4 text-rose-500" />
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    Lowercase letters, numbers, and underscores only
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* UPI ID */}
            <FormField
              control={form.control}
              name="upi_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-foreground">
                    UPI ID (Payment Handle)
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Wallet className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        placeholder="username@bank"
                        {...field}
                        className="pl-10 h-12 rounded-xl text-sm font-medium border-border/80 bg-muted/30 focus-visible:ring-primary font-mono"
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    Used by friends to settle payments with you
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex gap-2.5 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/profile")}
                className="flex-1 rounded-xl h-12 px-6 text-sm font-semibold border-border/80 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl h-12 px-6 text-sm font-semibold bg-primary hover:bg-primary/95 text-primary-foreground shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CustomCard>
    </PageLayout>
  );
}

export default EditUserProfile;

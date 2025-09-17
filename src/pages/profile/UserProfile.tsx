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
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import AvtarImg from "@/assets/Profile_avatar_placeholder_large.png";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";

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
      {
        message: "Profile picture is required and must be an image.",
      }
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
    .min(2, { message: "Username must be at least 2 characters." }),
});

function UserProfile() {
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [edit, setEdit] = useState(false);

  const handleImage = () => {
    setEdit(true);
  };
  const handleRemoveImage = () => {
    setEdit(false);
  };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      full_name: "",
      upi_id: "",
      profile_pic: undefined,
      username: "",
    },
  });

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get("/profile/me");

      if (res.status === 200) {
        setProfilePicUrl(res.data.profile_pic);
        form.reset({
          username: res.data.username ?? "",
          full_name: res.data.full_name ?? "",
          upi_id: res.data.upi_id ?? "",
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

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log("Form Data:", data);
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div>
      <div className="border-b mb-5 pb-3">
        <h1 className="text-xl mb-1 font-semibold">My Profile</h1>
        <p className="text-xs">Fill your details carefully.</p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
          encType="multipart/form-data"
        >
          {/* Profile Picture */}
          <FormField
            control={form.control}
            name="profile_pic"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="w-full bg-slate-100 py-5 rounded-xl relative">
                    <div className="relative w-[30%] mx-auto">
                      <img
                        src={
                          field.value
                            ? URL.createObjectURL(field.value)
                            : profilePicUrl || AvtarImg
                        }
                        alt="Profile preview"
                        className="w-full rounded-full object-cover aspect-square"
                      />
                      <div
                        onClick={handleImage}
                        className="text-center pt-4 cursor-pointer"
                      >
                        Edit
                      </div>
                    </div>
                    {edit && (
                      <>
                        <div className="bg-black opacity-90 text-white p-5">
                          <div className="flex justify-end">
                            <div
                              onClick={handleRemoveImage}
                              className="text-black bg-white p-2 text-center cursor-pointer rounded-full"
                            >
                              <X className="text-xl" />
                            </div>
                          </div>
                          <div className="mt-2 cursor-pointer">Add Image</div>
                          <div className="mt-2 cursor-pointer">
                            Delete Image
                          </div>
                        </div>
                      </>
                    )}

                    {/* hidden file input */}
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
                  <Input placeholder="user_name" {...field} />
                </FormControl>
                <FormDescription>
                  Use lowercase letters, numbers, and underscores only.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full h-10">
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default UserProfile;

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
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
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import PageLayout from "@/components/PageLayout";
import type { AxiosError } from "axios";
import { Skeleton } from "@/components/ui/skeleton";

interface GroupDetails {
  id: string;
  name: string;
  description: string;
  image: string | null;
  created_by: string;
  creator_name: string;
  is_admin: boolean;
  created_at: string;
}

const FormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Group name must be at least 2 characters." })
    .max(50, { message: "Group name must be at most 50 characters." }),
  description: z
    .string()
    .min(5, { message: "Description must be at least 5 characters." })
    .max(500, { message: "Description must be at most 500 characters." }),
  image: z
    .union([z.instanceof(File), z.string().nullable(), z.undefined()])
    .refine(
      (val) =>
        !val ||
        typeof val === "string" ||
        (val instanceof File &&
          ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(
            val.type,
          )),
      {
        message: "Only JPG, PNG, or WebP images are allowed.",
      },
    )
    .optional(),
});

const GroupEdit = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      description: "",
      image: null,
    },
  });

  // Fetch existing group details
  useEffect(() => {
    if (!groupId) return;

    const fetchGroup = async () => {
      setFetching(true);
      try {
        const res = await axiosInstance.get<GroupDetails>(`/groups/${groupId}`);
        const group = res.data;
        form.reset({
          name: group.name,
          description: group.description,
          image: group.image || null,
        });
        setImagePreview(group.image || null);
      } catch (error) {
        console.error("Failed to fetch group details:", error);
        toast.error("Failed to load group details");
        navigate(-1);
      } finally {
        setFetching(false);
      }
    };

    fetchGroup();
  }, [groupId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const removeImage = () => {
    form.setValue("image", null);
    setImagePreview(null);
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);

      if (data.image instanceof File) {
        formData.append("image", data.image);
      } else if (typeof data.image === "string") {
        formData.append("image", data.image);
      }

      const res = await axiosInstance.put(`/groups/${groupId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 200 || res.status === 201) {
        toast.success("Group updated successfully!");
        navigate(`/groups/${groupId}`);
      }
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.error("Group update failed:", err);
      toast.error(err.response?.data?.message || "Failed to update group");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <PageLayout title="Edit Group" isNav={false}>
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="w-24 h-24 rounded-xl" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Edit Group" isNav={false}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Group Image */}
          <FormField
            control={form.control}
            name="image"
            render={() => (
              <FormItem>
                <FormLabel>Group Image</FormLabel>
                <FormControl>
                  <div className="flex flex-col items-center gap-4">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Group preview"
                          className="w-24 h-24 rounded-xl object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="edit_group_image"
                        className="w-24 h-24 rounded-xl border-2 border-dashed border-muted-foreground/50 flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                      >
                        <ImageIcon className="size-8 text-muted-foreground" />
                      </label>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      id="edit_group_image"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Group Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter group name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your group..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Brief description about your group's purpose.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Group"
            )}
          </Button>
        </form>
      </Form>
    </PageLayout>
  );
};

export default GroupEdit;

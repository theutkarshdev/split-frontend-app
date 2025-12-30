import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useRef } from "react";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, ImageIcon, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import PageLayout from "@/components/PageLayout";
import type { AxiosError } from "axios";
import type { Profile } from "@/types/auth";
import AvtarImg from "@/assets/Profile_avatar_placeholder_large.png";
import { cn } from "@/lib/utils";

// Validation Schema
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
    .union([z.instanceof(File), z.string().optional(), z.undefined()])
    .refine(
      (val) =>
        !val ||
        typeof val === "string" ||
        (val instanceof File &&
          ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(
            val.type
          )),
      {
        message: "Only JPG, PNG, or WebP images are allowed.",
      }
    )
    .optional(),
  member_ids: z.array(z.string()).optional(),
});

const GroupCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<Profile[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<Profile[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      description: "",
      image: undefined,
      member_ids: [],
    },
  });

  // Search friends with debounce
  const searchFriends = (query: string) => {
    setSearchQuery(query);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length < 2) {
      setFriends([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setFriendsLoading(true);
      try {
        const res = await axiosInstance.get<Profile[]>(
          `/profile/search?query=${encodeURIComponent(
            query
          )}&friend_filter=friends`
        );
        if (Array.isArray(res.data)) {
          // Filter out already selected members from search results
          const filteredResults = res.data.filter(
            (friend) => !selectedMembers.some((m) => m.id === friend.id)
          );
          setFriends(filteredResults);
        }
      } catch (error) {
        console.error("Failed to search friends:", error);
        setFriends([]);
      } finally {
        setFriendsLoading(false);
      }
    }, 400);
  };

  // Handle member selection
  const toggleMember = (profile: Profile) => {
    const isSelected = selectedMembers.some((m) => m.id === profile.id);
    let newSelected: Profile[];

    if (isSelected) {
      newSelected = selectedMembers.filter((m) => m.id !== profile.id);
    } else {
      newSelected = [...selectedMembers, profile];
    }

    setSelectedMembers(newSelected);
    form.setValue(
      "member_ids",
      newSelected.map((m) => m.id)
    );
  };

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  // Remove image
  const removeImage = () => {
    form.setValue("image", undefined);
    setImagePreview(null);
  };

  // Submit handler
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);

      if (data.image instanceof File) {
        formData.append("image", data.image);
      }

      if (data.member_ids && data.member_ids.length > 0) {
        formData.append("member_ids", data.member_ids.join(","));
      }

      const res = await axiosInstance.post("/groups", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 200 || res.status === 201) {
        toast.success("Group created successfully!");
        navigate("/groups");
      }
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.error("Group creation failed:", err);
      toast.error(err.response?.data?.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageLayout title="New Group" isNav={false}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Group Image */}
          <FormField
            control={form.control}
            name="image"
            render={() => (
              <FormItem>
                <FormLabel>Group Image (Optional)</FormLabel>
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
                        htmlFor="group_image"
                        className="w-24 h-24 rounded-xl border-2 border-dashed border-muted-foreground/50 flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                      >
                        <ImageIcon className="size-8 text-muted-foreground" />
                      </label>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      id="group_image"
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

          {/* Member Selection */}
          <FormField
            control={form.control}
            name="member_ids"
            render={() => (
              <FormItem className="flex flex-col">
                <FormLabel>Add Members (Optional)</FormLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                      >
                        {selectedMembers.length > 0
                          ? `${selectedMembers.length} member${
                              selectedMembers.length > 1 ? "s" : ""
                            } selected`
                          : "Search friends..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search friends..."
                        value={searchQuery}
                        onValueChange={searchFriends}
                      />
                      <CommandList>
                        {friendsLoading && (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="size-5 animate-spin text-muted-foreground" />
                          </div>
                        )}
                        {!friendsLoading && searchQuery.length < 2 && (
                          <div className="py-6 text-center text-sm text-muted-foreground">
                            Type at least 2 characters to search
                          </div>
                        )}
                        {!friendsLoading &&
                          searchQuery.length >= 2 &&
                          friends.length === 0 && (
                            <CommandEmpty>No friends found.</CommandEmpty>
                          )}
                        <CommandGroup>
                          {friends.map((friend) => {
                            const isSelected = selectedMembers.some(
                              (m) => m.id === friend.id
                            );
                            return (
                              <CommandItem
                                key={friend.id}
                                value={`${friend.full_name} ${friend.username}`}
                                onSelect={() => toggleMember(friend)}
                                className="cursor-pointer"
                              >
                                <div className="flex items-center gap-3 w-full">
                                  <img
                                    src={friend.profile_pic || AvtarImg}
                                    alt={friend.full_name}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">
                                      {friend.full_name || friend.username}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      @{friend.username}
                                    </p>
                                  </div>
                                  <Check
                                    className={cn(
                                      "size-4",
                                      isSelected ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* Selected Members Chips */}
                {selectedMembers.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm"
                      >
                        <img
                          src={member.profile_pic || AvtarImg}
                          alt={member.full_name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span>{member.full_name || member.username}</span>
                        <button
                          type="button"
                          onClick={() => toggleMember(member)}
                          className="hover:text-destructive"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <FormDescription>
                  Select friends to add to this group.
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
                Creating...
              </>
            ) : (
              "Create Group"
            )}
          </Button>
        </form>
      </Form>
    </PageLayout>
  );
};

export default GroupCreate;

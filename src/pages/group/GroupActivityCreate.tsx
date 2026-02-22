import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect, useMemo } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, Loader2, ImageIcon, Trash2Icon } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import PageLayout from "@/components/PageLayout";
import type { AxiosError } from "axios";
import { getInitials } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import CustomCard from "@/components/CustomCard";

// Group Member type
interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  username: string;
  full_name: string;
  profile_pic: string | null;
  role: "admin" | "member";
  joined_at: string;
}

// Split type
type SplitType = "equal" | "exact" | "percentage";

// Member split data
interface MemberSplit {
  user_id: string;
  username: string;
  full_name: string;
  profile_pic: string | null;
  selected: boolean;
  amount: number;
  percentage: number;
}

// Reusable Split Type Tabs Component
interface SplitTypeTabsProps {
  splitType: SplitType;
  onSplitTypeChange: (type: SplitType) => void;
}

const SplitTypeTabs = ({
  splitType,
  onSplitTypeChange,
}: SplitTypeTabsProps) => (
  <div className="flex gap-2 mb-6">
    {(["equal", "exact", "percentage"] as SplitType[]).map((type) => (
      <Button
        key={type}
        type="button"
        variant={splitType === type ? "default" : "outline"}
        size="sm"
        className="flex-1 capitalize"
        onClick={() => onSplitTypeChange(type)}
      >
        {type === "exact"
          ? "Unequally"
          : type === "percentage"
            ? "By %"
            : "Equally"}
      </Button>
    ))}
  </div>
);

// Reusable Member Split List Component
interface MemberSplitListProps {
  memberSplits: MemberSplit[];
  splitType: SplitType;
  membersLoading: boolean;
  onToggleMember: (userId: string) => void;
  onUpdateAmount: (userId: string, amount: number) => void;
  onUpdatePercentage: (userId: string, percentage: number) => void;
}

const MemberSplitList = ({
  memberSplits,
  splitType,
  membersLoading,
  onToggleMember,
  onUpdateAmount,
  onUpdatePercentage,
}: MemberSplitListProps) => (
  <div className="space-y-3 flex-1 overflow-y-auto">
    {membersLoading ? (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    ) : (
      memberSplits.map((member) => (
        <div
          key={member.user_id}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg transition-colors",
            member.selected ? "bg-input/30" : "bg-transparent",
          )}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={member.profile_pic || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary">
              {getInitials(member.full_name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{member.full_name}</p>
            {splitType === "equal" && member.selected && (
              <p className="text-sm text-muted-foreground">
                ₹{member.amount.toFixed(2)}
              </p>
            )}
          </div>

          {splitType === "equal" && (
            <Button
              type="button"
              variant={member.selected ? "default" : "outline"}
              size="icon"
              className="h-5 w-5 rounded"
              onClick={() => onToggleMember(member.user_id)}
            >
              {member.selected && <Check className="size-4" />}
            </Button>
          )}

          {splitType === "exact" && (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">₹</span>
              <Input
                type="number"
                step="0.01"
                value={member.amount || ""}
                onChange={(e) =>
                  onUpdateAmount(member.user_id, parseFloat(e.target.value))
                }
                className="w-20 h-8 text-right"
                placeholder="0.00"
              />
            </div>
          )}

          {splitType === "percentage" && (
            <div className="flex items-center gap-1">
              <Input
                type="number"
                step="0.1"
                max="100"
                value={member.percentage || ""}
                onChange={(e) =>
                  onUpdatePercentage(member.user_id, parseFloat(e.target.value))
                }
                className="w-16 h-8 text-right"
                placeholder="0"
              />
              <span className="text-muted-foreground">%</span>
            </div>
          )}
        </div>
      ))
    )}
  </div>
);

// Reusable Split Summary Component
interface SplitSummaryProps {
  splitType: SplitType;
  totalAmount: number;
  selectedMembersCount: number;
  totalSplitAmount: number;
  amountRemaining: number;
  totalPercentage: number;
}

const SplitSummary = ({
  splitType,
  totalAmount,
  selectedMembersCount,
  totalSplitAmount,
  amountRemaining,
  totalPercentage,
}: SplitSummaryProps) => (
  <div className="mt-4 pt-4 border-t border-border">
    {splitType === "equal" && (
      <div className="text-center">
        <p className="text-lg font-semibold">
          ₹{(totalAmount / (selectedMembersCount || 1)).toFixed(2)} /person
        </p>
        <p className="text-sm text-muted-foreground">
          ({selectedMembersCount} people)
        </p>
      </div>
    )}

    {splitType === "exact" && (
      <div className="text-center">
        <p className="text-lg font-semibold">
          ₹{totalSplitAmount.toFixed(2)} of ₹{totalAmount.toFixed(2)}
        </p>
        <p
          className={cn(
            "text-sm",
            Math.abs(amountRemaining) < 0.01
              ? "text-green-500"
              : "text-destructive",
          )}
        >
          {amountRemaining > 0.01
            ? `₹${amountRemaining.toFixed(2)} left`
            : amountRemaining < -0.01
              ? `₹${Math.abs(amountRemaining).toFixed(2)} over`
              : "Perfectly split!"}
        </p>
      </div>
    )}

    {splitType === "percentage" && (
      <div className="text-center">
        <p className="text-lg font-semibold">
          {totalPercentage.toFixed(1)}% of 100%
        </p>
        <p
          className={cn(
            "text-sm",
            Math.abs(totalPercentage - 100) < 0.01
              ? "text-green-500"
              : "text-destructive",
          )}
        >
          {totalPercentage < 99.99
            ? `${(100 - totalPercentage).toFixed(1)}% remaining`
            : totalPercentage > 100.01
              ? `${(totalPercentage - 100).toFixed(1)}% over`
              : "Perfectly split!"}
        </p>
      </div>
    )}
  </div>
);

// Validation Schema for Step 1
const Step1Schema = z.object({
  total_amount: z
    .string()
    .min(1, { message: "Amount is required" })
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be greater than 0",
    }),
  note: z.string().optional(),
});

const GroupActivityCreate = () => {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();

  // Form state
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(true);

  // Members and split state
  const [memberSplits, setMemberSplits] = useState<MemberSplit[]>([]);
  const [splitType, setSplitType] = useState<SplitType>("equal");

  // Attachment state
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(
    null,
  );

  // Handle attachment change
  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (
        !["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(
          file.type,
        )
      ) {
        toast.error("Only JPG, PNG, or WebP images are allowed");
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setAttachmentFile(file);
      setAttachmentPreview(URL.createObjectURL(file));
    }
  };

  // Remove attachment
  const removeAttachment = () => {
    setAttachmentFile(null);
    if (attachmentPreview) {
      URL.revokeObjectURL(attachmentPreview);
      setAttachmentPreview(null);
    }
  };

  // Form for step 1
  const form = useForm<z.infer<typeof Step1Schema>>({
    resolver: zodResolver(Step1Schema),
    defaultValues: {
      total_amount: "",
      note: "",
    },
  });

  const totalAmount = parseFloat(form.watch("total_amount")) || 0;

  // Fetch group members on mount
  useEffect(() => {
    const fetchMembers = async () => {
      if (!groupId) return;
      try {
        setMembersLoading(true);
        const res = await axiosInstance.get<GroupMember[]>(
          `/groups/${groupId}/members`,
        );
        // Initialize member splits with all members selected
        setMemberSplits(
          res.data.map((member) => ({
            user_id: member.user_id,
            username: member.username,
            full_name: member.full_name,
            profile_pic: member.profile_pic,
            selected: true,
            amount: 0,
            percentage: 0,
          })),
        );
      } catch (error) {
        console.error("Failed to fetch members:", error);
        toast.error("Failed to load group members");
      } finally {
        setMembersLoading(false);
      }
    };

    fetchMembers();
  }, [groupId]);

  // Calculate equal splits when total amount or selected members change
  useEffect(() => {
    if (splitType === "equal") {
      const selectedMembers = memberSplits.filter((m) => m.selected);
      const perPerson =
        selectedMembers.length > 0 ? totalAmount / selectedMembers.length : 0;
      setMemberSplits((prev) =>
        prev.map((m) => ({
          ...m,
          amount: m.selected ? parseFloat(perPerson.toFixed(2)) : 0,
          percentage: m.selected
            ? parseFloat((100 / selectedMembers.length).toFixed(2))
            : 0,
        })),
      );
    }
  }, [totalAmount, splitType]);

  // Selected members count
  const selectedMembersCount = useMemo(
    () => memberSplits.filter((m) => m.selected).length,
    [memberSplits],
  );

  // Calculate total split amount
  const totalSplitAmount = useMemo(
    () =>
      memberSplits
        .filter((m) => m.selected)
        .reduce((sum, m) => sum + m.amount, 0),
    [memberSplits],
  );

  // Calculate total percentage
  const totalPercentage = useMemo(
    () =>
      memberSplits
        .filter((m) => m.selected)
        .reduce((sum, m) => sum + m.percentage, 0),
    [memberSplits],
  );

  // Amount remaining
  const amountRemaining = useMemo(
    () => totalAmount - totalSplitAmount,
    [totalAmount, totalSplitAmount],
  );

  // Toggle member selection
  const toggleMemberSelection = (userId: string) => {
    setMemberSplits((prev) => {
      const newSplits = prev.map((m) =>
        m.user_id === userId ? { ...m, selected: !m.selected } : m,
      );

      // Recalculate for equal split
      if (splitType === "equal") {
        const selectedMembers = newSplits.filter((m) => m.selected);
        const perPerson =
          selectedMembers.length > 0 ? totalAmount / selectedMembers.length : 0;
        return newSplits.map((m) => ({
          ...m,
          amount: m.selected ? parseFloat(perPerson.toFixed(2)) : 0,
          percentage: m.selected
            ? parseFloat((100 / selectedMembers.length).toFixed(2))
            : 0,
        }));
      }

      return newSplits;
    });
  };

  // Update member amount (for exact split)
  const updateMemberAmount = (userId: string, amount: number) => {
    setMemberSplits((prev) =>
      prev.map((m) =>
        m.user_id === userId
          ? { ...m, amount: isNaN(amount) ? 0 : amount, selected: amount > 0 }
          : m,
      ),
    );
  };

  // Update member percentage (for percentage split)
  const updateMemberPercentage = (userId: string, percentage: number) => {
    setMemberSplits((prev) =>
      prev.map((m) =>
        m.user_id === userId
          ? {
              ...m,
              percentage: isNaN(percentage) ? 0 : percentage,
              amount: parseFloat(
                (
                  (totalAmount * (isNaN(percentage) ? 0 : percentage)) /
                  100
                ).toFixed(2),
              ),
              selected: percentage > 0,
            }
          : m,
      ),
    );
  };

  // Handle split type change
  const handleSplitTypeChange = (type: SplitType) => {
    setSplitType(type);

    if (type === "equal") {
      // Recalculate equal splits
      const selectedMembers = memberSplits.filter((m) => m.selected);
      const perPerson =
        selectedMembers.length > 0 ? totalAmount / selectedMembers.length : 0;
      setMemberSplits((prev) =>
        prev.map((m) => ({
          ...m,
          amount: m.selected ? parseFloat(perPerson.toFixed(2)) : 0,
          percentage: m.selected
            ? parseFloat((100 / selectedMembers.length).toFixed(2))
            : 0,
        })),
      );
    } else if (type === "exact" || type === "percentage") {
      // Reset amounts for manual input
      setMemberSplits((prev) =>
        prev.map((m) => ({
          ...m,
          amount: 0,
          percentage: 0,
          selected: true,
        })),
      );
    }
  };

  // Go to step 2
  const goToStep2 = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      setStep(2);
    }
  };

  // Go back to step 1
  const goToStep1 = () => {
    setStep(1);
  };

  // Validate split before submission
  const validateSplit = (): boolean => {
    if (selectedMembersCount < 1) {
      toast.error("Please select at least one member");
      return false;
    }

    if (splitType === "exact") {
      if (Math.abs(amountRemaining) > 0.01) {
        toast.error(
          `Split amounts don't match. ₹${Math.abs(amountRemaining).toFixed(
            2,
          )} ${amountRemaining > 0 ? "remaining" : "over"}`,
        );
        return false;
      }
    }

    if (splitType === "percentage") {
      if (Math.abs(totalPercentage - 100) > 0.01) {
        toast.error(
          `Total percentage must equal 100%. Currently ${totalPercentage.toFixed(
            1,
          )}%`,
        );
        return false;
      }
    }

    return true;
  };

  // Submit handler
  const onSubmit = async (data: z.infer<typeof Step1Schema>) => {
    if (!validateSplit()) return;
    if (!groupId) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("total_amount", data.total_amount);
      formData.append("split_type", splitType);

      if (data.note) {
        formData.append("note", data.note);
      }

      if (attachmentFile) {
        formData.append("file", attachmentFile);
      }

      if (splitType === "equal") {
        // For equal split, only send member_ids of selected members
        const selectedMemberIds = memberSplits
          .filter((m) => m.selected)
          .map((m) => m.user_id)
          .join(",");
        formData.append("member_ids", selectedMemberIds);
      } else {
        // For exact or percentage split, send splits_json
        const splitsJson = memberSplits
          .filter((m) => m.selected && (m.amount > 0 || m.percentage > 0))
          .map((m) => ({
            user_id: m.user_id,
            amount: m.amount,
            percentage: splitType === "percentage" ? m.percentage : undefined,
          }));
        formData.append("splits_json", JSON.stringify(splitsJson));
      }

      const res = await axiosInstance.post(
        `/groups/${groupId}/activities`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (res.status === 200 || res.status === 201) {
        toast.success("Expense created successfully!");
        navigate(`/groups/${groupId}`);
      }
    } catch (error) {
      const err = error as AxiosError<{ detail?: string }>;
      console.error("Failed to create expense:", error);
      toast.error(err.response?.data?.detail || "Failed to create expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout title={step === 2 ? "Split Expense" : "Add New Expense"}>
      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (step === 2) {
              form.handleSubmit(onSubmit)(e);
            }
          }}
          className="flex flex-col h-full"
        >
          {step === 1 && (
            <div className="flex-1 space-y-6 p-4">
              {/* Amount Field */}
              <FormField
                control={form.control}
                name="total_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes Field */}
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add a note..."
                        className="resize-none min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Attachment Field */}
              <div className="space-y-2">
                <FormLabel>Attachment</FormLabel>
                {attachmentPreview ? (
                  <div className="relative">
                    <CustomCard radius={12} className="overflow-hidden">
                      <img
                        src={attachmentPreview}
                        alt="Attachment preview"
                        className="w-full h-40 object-cover"
                      />
                    </CustomCard>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={removeAttachment}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label htmlFor="attachment-input" className="cursor-pointer">
                    <CustomCard
                      radius={10}
                      className="p-4 bg-input/30 hover:bg-input/50 transition-colors border-2 border-dashed border-muted-foreground/30"
                    >
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <ImageIcon className="h-8 w-8" />
                        <span className="text-sm">
                          Tap to add receipt or image
                        </span>
                      </div>
                    </CustomCard>
                    <input
                      id="attachment-input"
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      className="hidden"
                      onChange={handleAttachmentChange}
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex-1 p-4 flex flex-col">
              <SplitTypeTabs
                splitType={splitType}
                onSplitTypeChange={handleSplitTypeChange}
              />

              <MemberSplitList
                memberSplits={memberSplits}
                splitType={splitType}
                membersLoading={membersLoading}
                onToggleMember={toggleMemberSelection}
                onUpdateAmount={updateMemberAmount}
                onUpdatePercentage={updateMemberPercentage}
              />

              <SplitSummary
                splitType={splitType}
                totalAmount={totalAmount}
                selectedMembersCount={selectedMembersCount}
                totalSplitAmount={totalSplitAmount}
                amountRemaining={amountRemaining}
                totalPercentage={totalPercentage}
              />
            </div>
          )}

          {/* Footer Buttons */}
          <div className="p-4 flex gap-3 mt-auto">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                if (step === 2) {
                  goToStep1();
                } else {
                  navigate(-1);
                }
              }}
            >
              Cancel
            </Button>
            {step === 1 ? (
              <Button
                type="button"
                className="flex-1"
                onClick={(e) => {
                  e.preventDefault();
                  goToStep2();
                }}
                disabled={!totalAmount || totalAmount <= 0}
              >
                Next
              </Button>
            ) : (
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </PageLayout>
  );
};

export default GroupActivityCreate;

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import {
  Check,
  CheckCircle2,
  Loader2,
  Plus,
  Receipt,
  Trash2,
  UploadCloud,
  X,
  XCircle,
} from "lucide-react";
import { Textarea } from "./ui/textarea";
import axiosInstance from "@/lib/axiosInstance";
import { useState, useRef } from "react";

const FormSchema = z
  .object({
    total_amount: z
      .number({ message: "Total amount is required" })
      .positive("Total amount must be greater than 0"),
    amount: z
      .number({ message: "Their share is required" })
      .min(0, "Amount cannot be negative"),
    note: z
      .string()
      .max(200, "Description must be under 200 characters")
      .optional(),
    file: z
      .any()
      .refine(
        (file) =>
          file === undefined ||
          (file instanceof File && file.size <= 3 * 1024 * 1024),
        { message: "File must be less than 3MB" }
      )
      .optional(),
  })
  .refine((data) => data.total_amount >= data.amount, {
    message: "Total amount cannot be less than their share",
    path: ["total_amount"],
  });

interface AddActivityFormProps {
  to_user_id: string;
  onActivityAdded?: (page: number) => void;
  triggerButton?: React.ReactNode;
}

type Status = "idle" | "loading" | "success" | "error";

const QUICK_CATEGORIES = [
  { label: "Coffee", emoji: "☕" },
  { label: "Food", emoji: "🍕" },
  { label: "Cab", emoji: "🚕" },
  { label: "Grocery", emoji: "🛒" },
  { label: "Movie", emoji: "🎬" },
  { label: "Drinks", emoji: "🍻" },
  { label: "Bills", emoji: "⚡" },
  { label: "Travel", emoji: "✈️" },
];

function AddActivityForm({
  to_user_id,
  onActivityAdded,
  triggerButton,
}: AddActivityFormProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      total_amount: undefined,
      amount: undefined,
      note: "",
      file: undefined,
    },
  });

  const watchNote = form.watch("note");

  const handleToggleTag = (tag: string) => {
    const currentNote = form.getValues("note") || "";
    if (currentNote.includes(tag)) {
      const updated = currentNote
        .replace(tag, "")
        .replace(/\s+/g, " ")
        .trim();
      form.setValue("note", updated);
    } else {
      const updated = currentNote ? `${currentNote} · ${tag}` : tag;
      form.setValue("note", updated);
    }
  };

  const handleFileChange = (file?: File) => {
    if (file) {
      form.setValue("file", file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      form.setValue("file", undefined);
      setPreviewUrl(null);
    }
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setStatus("loading");
    const formData = new FormData();
    formData.append("to_user_id", to_user_id);
    formData.append("type", "paid");
    formData.append("amount", data.amount!.toString());
    formData.append("total_amount", data.total_amount!.toString());
    if (data.note) formData.append("note", data.note);
    if (data.file) formData.append("file", data.file);

    try {
      await axiosInstance.post("/activities", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Expense added successfully!");
      form.reset();
      setPreviewUrl(null);
      if (onActivityAdded) onActivityAdded(1);
      setStatus("success");

      setTimeout(() => {
        setOpen(false);
        setStatus("idle");
      }, 1200);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || err.message || "Failed to add expense"
      );
      setStatus("error");
      setTimeout(() => setStatus("idle"), 1500);
    }
  }

  const defaultTrigger = (
    <Button className="rounded-xl px-5 h-11 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm active:scale-98 cursor-pointer flex items-center gap-2">
      <Plus className="size-4" /> Add Expense
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerButton || defaultTrigger}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100%-1.25rem)] max-w-lg sm:max-w-3xl md:max-w-4xl lg:max-w-4xl xl:max-w-5xl rounded-3xl sm:rounded-[2.5rem] border border-border/80 dark:border-white/[0.12] bg-card p-0 shadow-2xl overflow-hidden gap-0 flex flex-col h-[90dvh] sm:h-auto sm:max-h-[88dvh]"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Split an expense or bill with your friend
          </DialogDescription>
        </DialogHeader>

        {/* 1. PINNED MODAL HEADER */}
        <div className="shrink-0 flex items-center justify-between gap-3 px-5 py-4 sm:px-8 sm:py-5 lg:px-10 lg:py-6 border-b border-border/80 dark:border-white/[0.08] bg-card">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="size-10 sm:size-12 lg:size-13 rounded-2xl bg-primary/10 border border-primary/20 text-primary grid place-content-center shrink-0 shadow-xs">
              <Receipt className="size-5 sm:size-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-2xl font-black tracking-tight text-foreground truncate">
                Add New Expense
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                Split an expense or bill with your friend
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="size-9 sm:size-10 rounded-xl border border-border/80 dark:border-white/[0.12] bg-card hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
            title="Close"
            aria-label="Close dialog"
          >
            <X className="size-4.5 sm:size-5" />
          </button>
        </div>

        {/* 2. BODY & FOOTER / STATUS FEEDBACK */}
        {status !== "idle" ? (
          <div className="flex-1 flex flex-col justify-center items-center p-8 gap-3 text-center min-h-[280px]">
            {status === "loading" && (
              <>
                <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                  <Loader2 className="size-8 text-primary animate-spin" />
                </div>
                <p className="text-base font-bold text-foreground">
                  Submitting Expense...
                </p>
                <p className="text-xs text-muted-foreground">
                  Updating mutual ledger and activity timeline
                </p>
              </>
            )}
            {status === "success" && (
              <>
                <div className="size-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-1 animate-in zoom-in-75 duration-200">
                  <CheckCircle2 className="size-9 text-emerald-500" />
                </div>
                <p className="text-lg font-extrabold text-foreground">
                  Expense Added Successfully!
                </p>
                <p className="text-xs text-muted-foreground">
                  The balance has been updated for both of you.
                </p>
              </>
            )}
            {status === "error" && (
              <>
                <div className="size-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-1 animate-in zoom-in-75 duration-200">
                  <XCircle className="size-9 text-rose-500" />
                </div>
                <p className="text-lg font-extrabold text-rose-500">
                  Submission Failed
                </p>
                <p className="text-xs text-muted-foreground">
                  Please check the details and try again.
                </p>
              </>
            )}
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col flex-1 min-h-0 overflow-hidden"
            >
              {/* Scrollable Form Body */}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-7 lg:p-10 space-y-4 sm:space-y-6">
                {/* 1. AMOUNTS ROW */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    {/* Total Bill Input */}
                    <FormField
                      control={form.control}
                      name="total_amount"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              Total Bill (₹)
                            </FormLabel>
                            <span className="text-[11px] font-semibold text-primary">
                              Full amount
                            </span>
                          </div>
                          <FormControl>
                            <div className="relative group">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg sm:text-xl font-black text-muted-foreground/80 group-focus-within:text-primary transition-colors select-none pointer-events-none">
                                ₹
                              </span>
                              <Input
                                type="number"
                                placeholder="0"
                                inputMode="decimal"
                                {...field}
                                value={field.value !== undefined ? field.value : ""}
                                className="no-stepper-arrows pl-9 sm:pl-10 pr-4 h-12 sm:h-14 text-xl sm:text-2xl font-black tracking-tight rounded-2xl bg-card border-border/80 dark:border-white/[0.12] focus-visible:ring-primary shadow-xs transition-all"
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === "" ? undefined : Number(e.target.value)
                                  )
                                }
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />

                    {/* Their Share Input */}
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              Their Share (₹)
                            </FormLabel>
                            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              To be paid by them
                            </span>
                          </div>
                          <FormControl>
                            <div className="relative group">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg sm:text-xl font-black text-muted-foreground/80 group-focus-within:text-emerald-500 transition-colors select-none pointer-events-none">
                                ₹
                              </span>
                              <Input
                                type="number"
                                placeholder="0"
                                inputMode="decimal"
                                {...field}
                                value={field.value !== undefined ? field.value : ""}
                                className="no-stepper-arrows pl-9 sm:pl-10 pr-4 h-12 sm:h-14 text-xl sm:text-2xl font-black tracking-tight rounded-2xl bg-card border-border/80 dark:border-white/[0.12] focus-visible:ring-emerald-500 shadow-xs transition-all"
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === "" ? undefined : Number(e.target.value)
                                  )
                                }
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* 2. QUICK TAGS */}
                <div className="space-y-2">
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Quick Category Tags
                  </FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_CATEGORIES.map((cat) => {
                      const fullTag = `${cat.emoji} ${cat.label}`;
                      const isSelected = watchNote?.includes(cat.label);

                      return (
                        <button
                          key={cat.label}
                          type="button"
                          onClick={() => handleToggleTag(fullTag)}
                          className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                            isSelected
                              ? "bg-primary/15 border-primary/50 text-primary shadow-xs"
                              : "border-border/80 dark:border-white/[0.08] bg-card hover:bg-muted/80 text-foreground/80 hover:text-foreground"
                          }`}
                        >
                          <span>{cat.emoji}</span>
                          <span>{cat.label}</span>
                          {isSelected && <Check className="size-3 stroke-[2.5]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. NOTE & RECEIPT ATTACHMENT (2-Columns on md+) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {/* Note Field */}
                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem className="space-y-2 flex flex-col justify-between">
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Description / Note
                        </FormLabel>
                        <FormControl className="grow">
                          <Textarea
                            placeholder="e.g. Dinner at Olive Garden, Friday movie tickets..."
                            className="resize-none rounded-2xl text-sm bg-card border-border/80 dark:border-white/[0.12] focus-visible:ring-primary p-3.5 min-h-[90px] md:min-h-[120px] shadow-xs"
                            rows={3}
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />

                  {/* Receipt Upload Dropzone */}
                  <div className="space-y-2 flex flex-col justify-between">
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      Receipt / Bill Photo
                    </FormLabel>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e.target.files?.[0])}
                    />

                    {previewUrl ? (
                      <div className="relative rounded-2xl border border-border/80 dark:border-white/[0.12] overflow-hidden h-[90px] md:h-[120px] w-full group shadow-xs">
                        <img
                          src={previewUrl}
                          alt="Receipt preview"
                          className="size-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => handleFileChange(undefined)}
                            className="h-8 px-3 text-xs font-semibold rounded-xl cursor-pointer"
                          >
                            <Trash2 className="size-3.5 mr-1" /> Remove Photo
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-border/80 hover:border-primary/60 dark:border-white/[0.12] rounded-2xl p-3.5 md:p-5 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-muted/20 hover:bg-muted/40 transition-all group min-h-[90px] md:min-h-[120px] grow"
                      >
                        <div className="size-9 rounded-xl bg-muted/80 grid place-content-center text-muted-foreground group-hover:text-primary transition-colors">
                          <UploadCloud className="size-4.5" />
                        </div>
                        <div className="text-center">
                          <span className="text-xs font-bold text-foreground block">
                            Upload bill or receipt
                          </span>
                          <span className="text-[10px] sm:text-[11px] text-muted-foreground">
                            PNG, JPG, WEBP up to 3MB
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. PINNED ACTION FOOTER - ALWAYS 100% VISIBLE AT BOTTOM */}
              <div className="shrink-0 p-3.5 sm:p-5 lg:px-10 border-t border-border/80 dark:border-white/[0.1] bg-card flex items-center gap-2.5 sm:gap-3 z-20">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-xl sm:rounded-2xl h-11 sm:h-13 text-sm font-semibold border-border/80 hover:bg-muted text-foreground cursor-pointer shadow-xs active:scale-98"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="flex-1 rounded-xl sm:rounded-2xl h-11 sm:h-13 text-xs sm:text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md cursor-pointer active:scale-98 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4"
                >
                  <Plus className="size-4 sm:size-4.5 shrink-0" />
                  <span className="truncate">Save & Split Expense</span>
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default AddActivityForm;

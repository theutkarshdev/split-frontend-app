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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { PlusIcon } from "lucide-react";
import { Textarea } from "./ui/textarea";
import axiosInstance from "@/lib/axiosInstance";
import { useState } from "react";

// ✅ Validation Schema
const FormSchema = z
  .object({
    total_amount: z
      .number({ message: "Total amount is required" })
      .positive("Total amount must be greater than 0"),
    amount: z
      .number({ message: "Amount is required" })
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
    message: "Total amount cannot be less than amount",
    path: ["total_amount"], // show error under total_amount field
  });


interface AddActivityFormProps {
  to_user_id: string;
  onActivityAdded?: (page: number) => void; // ✅ new prop
}

function AddActivityForm({
  to_user_id,
  onActivityAdded,
}: AddActivityFormProps) {
  const [open, setOpen] = useState(false); // ✅ controls Drawer
  const [loading, setLoading] = useState(false); // ✅ loading state

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      total_amount: undefined,
      amount: undefined,
      note: "",
      file: undefined,
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true);
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
      if (onActivityAdded) onActivityAdded(1);
      setOpen(false); // ✅ close drawer after submit
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || err.message || "Failed to add expense"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button>
          <PlusIcon className="mr-2" /> Add Expense
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="items-start border-b">
          <DrawerTitle className="text-lg">Add Expense</DrawerTitle>
          <DrawerDescription>Fill out the details below.</DrawerDescription>
        </DrawerHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 p-5 max-h-[60vh] overflow-y-auto"
          >
            <div className="flex gap-3 justify-stretch">
              <FormField
                control={form.control}
                name="total_amount"
                render={({ field }) => (
                  <FormItem className="grow">
                    <FormLabel>Total Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        inputMode="numeric"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="grow">
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        inputMode="numeric"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attachment</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        field.onChange(e.target.files?.[0] ?? undefined)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional note..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-5 justify-end">
              <DrawerClose asChild>
                <Button type="button" variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </DrawerClose>
              <Button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  );
}

export default AddActivityForm;
 
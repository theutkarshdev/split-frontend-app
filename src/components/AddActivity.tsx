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

// ✅ Validation Schema
const FormSchema = z.object({
  totalAmount: z
    .number({ message: "Total amount is required" })
    .positive("Total amount must be greater than 0"),
  amountForFriend: z
    .number({ message: "Enter a valid number" })
    .min(0, "Amount cannot be negative"),
  description: z
    .string()
    .max(200, "Description must be under 200 characters")
    .optional(),
  bill: z
    .any()
    .refine((file) => file instanceof File || file === undefined, {
      message: "Please upload a valid file",
    })
    .optional(),
});

function AddActivityForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      totalAmount: undefined,
      amountForFriend: undefined,
      description: "",
      bill: undefined,
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    // handle file upload here as well
    console.log("Form Data: ", data);
    toast.success("Expense added successfully!");
  }

  return (
    <Drawer>
      <DrawerTrigger>
        <Button>
          <PlusIcon className="mr-2" />
          Add Expense
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
            {/* Total Amount */}
            <div className="flex gap-3">
              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="500"
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

              {/* Amount for Friend */}
              <FormField
                control={form.control}
                name="amountForFriend"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount for Friend</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="200"
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
              name="bill"
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="This expense is for..."
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
              <DrawerClose>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DrawerClose>
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  );
}

export default AddActivityForm;

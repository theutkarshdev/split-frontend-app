import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";

const schema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters"),
  file: z.any().optional(),
});

const ReportIssue = ({
  showReportDrawer,
  setShowReportDrawer,
}: {
  showReportDrawer: boolean;
  setShowReportDrawer: (open: boolean) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: { description: "", file: undefined },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("description", data.description);
      if (data.file && data.file[0]) {
        formData.append("file", data.file[0]);
      }
      await axiosInstance.post("/profile/report", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Issue reported successfully!");
      methods.reset();
      setShowReportDrawer(false);
    } catch (error) {
      toast.error("Failed to report issue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={showReportDrawer} onOpenChange={setShowReportDrawer}>
      <DrawerContent className="!rounded-4xl">
        <DrawerHeader className="items-start border-b">
          <DrawerTitle>Report an Issue</DrawerTitle>
          <DrawerDescription className="text-left">
            Please describe your issue.
          </DrawerDescription>
        </DrawerHeader>
        <FormProvider {...methods}>
          <form
            className="space-y-4 p-5"
            onSubmit={methods.handleSubmit(onSubmit)}
          >
            <FormField
              name="description"
              control={methods.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe your issue..."
                      disabled={loading}
                      className="h-40"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="file"
              control={methods.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attachment</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      onChange={(e) => field.onChange(e.target.files)}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </FormProvider>
      </DrawerContent>
    </Drawer>
  );
};

export default ReportIssue;

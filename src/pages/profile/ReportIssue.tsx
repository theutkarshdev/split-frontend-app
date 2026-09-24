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
import { Loader2 } from "lucide-react";

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
      toast.success("Issue reported successfully! Our team will review it.");
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
      <DrawerContent className="max-w-md mx-auto rounded-t-[2rem] border-t border-border/80 dark:border-white/10 p-0 overflow-hidden">
        <DrawerHeader className="text-left px-5 pt-4 pb-2 border-b border-border/60">
          <DrawerTitle className="text-base font-bold tracking-tight">
            Report an Issue / Feedback
          </DrawerTitle>
          <DrawerDescription className="text-xs text-muted-foreground">
            Let us know what went wrong or how we can improve Spilly.
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
                  <FormLabel className="text-xs font-semibold text-foreground">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe what happened or steps to reproduce..."
                      disabled={loading}
                      className="h-32 text-sm rounded-xl bg-muted/30 border-border/70 focus-visible:ring-primary resize-none p-3"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              name="file"
              control={methods.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-foreground">
                    Screenshot / Attachment (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => field.onChange(e.target.files)}
                      disabled={loading}
                      className="text-xs h-11 rounded-xl bg-muted/30 border-border/70 cursor-pointer file:cursor-pointer"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-sm font-semibold bg-primary hover:bg-primary/95 text-primary-foreground shadow-sm cursor-pointer flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Submitting...
                </>
              ) : (
                "Submit Report"
              )}
            </Button>
          </form>
        </FormProvider>
      </DrawerContent>
    </Drawer>
  );
};

export default ReportIssue;

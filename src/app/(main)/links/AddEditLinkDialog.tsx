import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import LoadingButton from "@/components/LoadingButton";
import { FiTrash } from "react-icons/fi";
import { addLinkSchema, AddLinkValues } from "@/lib/validation";
import { toast } from "@/components/ui/use-toast";

interface EditLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingLink?: { id: string; title: string; url: string; category: string } | null;
}

export default function EditLinkDialog({ open, onOpenChange, existingLink }: EditLinkDialogProps) {
  const form = useForm<AddLinkValues>({
    resolver: zodResolver(addLinkSchema),
    defaultValues: existingLink || {
      title: "",
      url: "",
      category: "",
    },
  });

  const [loading, setLoading] = useState(false);

  async function handleSubmit(values: AddLinkValues) {
    setLoading(true);

    try {
      const response = await fetch(`/api/links${existingLink ? `/${existingLink.id}` : ""}`, {
        method: existingLink ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to save the link");
      }

      toast({ description: `Link ${existingLink ? "updated" : "added"} successfully!` });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", description: "An error occurred while saving the link" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!existingLink) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/links/${existingLink.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete the link");
      }

      toast({ description: "Link deleted successfully!" });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", description: "An error occurred while deleting the link" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existingLink ? "Edit Link" : "Add Link"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter link title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter link URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              {existingLink && (
                <button
                  type="button"
                  className="text-red-600 hover:text-red-800 flex items-center gap-1"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  <FiTrash /> Delete
                </button>
              )}
              <LoadingButton type="submit" loading={loading}>
                Save
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { Button } from "@/components/ui/button";
import { LinkData } from "@/lib/types";
import { useState } from "react";
import AddEditLinkDialog from "./AddEditLinkDialog";

interface AddEditLinkButtonProps {
  type: "add" | "edit";
  existingLink?: LinkData;
}

export default function AddEditLinkButton({ existingLink, type }: AddEditLinkButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setShowDialog(true)}>
        {type == "add" ? "Add Link" : "Edit Link"}
      </Button>
      <AddEditLinkDialog
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </>
  );
}

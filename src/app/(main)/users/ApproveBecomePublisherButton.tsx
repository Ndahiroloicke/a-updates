"use client";

import { Button } from "@/components/ui/button";
import { UserData } from "@/lib/types";
import { useState } from "react";
import ApproveBecomePublisherDialog from "./ApproveBecomePublisherDialog";
import { PublisherRequest } from "@prisma/client";


export default function ApproveBecomePublisherButton({ request }: {
  request: PublisherRequest & {
    user: UserData
  }
}) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Button variant="default" onClick={() => setShowDialog(true)}>
        View
      </Button>
      <ApproveBecomePublisherDialog
        request={request}
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </>
  );
}

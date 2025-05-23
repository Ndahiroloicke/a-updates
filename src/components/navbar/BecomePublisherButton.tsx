"use client";

import { Button } from "@/components/ui/button";
import { UserData } from "@/lib/types";
import { useState } from "react";
import BecomePublisherDialog from "./BecomePublisherDialog";


export default function BecomePublisherButton({ user }: { user: UserData }) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Button variant="default" onClick={() => setShowDialog(true)}>
        Become Publisher
      </Button>
      <BecomePublisherDialog
        user={user}
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </>
  );
}

import SubAdminManager from "@/components/admin/SubAdminManager";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SubAdminsPage() {
  return (
    <div className="min-h-screen w-full">
      <div className="w-full">
        <div className="mb-6">
          <Button
            asChild
            variant="ghost"
            className="gap-2 pl-0 text-green-600 hover:bg-transparent hover:text-green-700"
          >
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
              Return to Dashboard
            </Link>
          </Button>
        </div>
        <SubAdminManager />
      </div>
    </div>
  );
}

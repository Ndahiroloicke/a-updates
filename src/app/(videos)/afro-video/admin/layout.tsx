import { redirect } from "next/navigation";
import { validateRequest } from "@/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await validateRequest();

  // Redirect non-admin users
  if (!user || (user.role !== "ADMIN" && user.role !== "SUB_ADMIN")) {
    redirect("/afro-video");
  }

  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
} 
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import {
  Home, Users, MessageSquare, AlertTriangle,
  Ban, Globe, FileText, LayoutGrid
} from "lucide-react"

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="bg-card rounded-lg shadow-sm p-4 space-y-2 sticky top-4">
      <nav className="space-y-1">
        <Button
          asChild
          variant="ghost"
          className={`w-full justify-start hover:bg-accent hover:text-accent-foreground ${
            pathname === "/home" ? "bg-accent text-accent-foreground" : ""
          }`}
        >
          <Link href="/home" className="flex items-center gap-3">
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </Button>

        <Button
          asChild
          variant="ghost"
          className={`w-full justify-start hover:bg-accent hover:text-accent-foreground ${
            pathname === "/country" ? "bg-accent text-accent-foreground" : ""
          }`}
        >
          <Link href="/country" className="flex items-center gap-3">
            <Globe className="w-4 h-4" />
            <span>Country</span>
          </Link>
        </Button>

        <Button
          asChild
          variant="ghost"
          className={`w-full justify-start hover:bg-accent hover:text-accent-foreground ${
            pathname === "/post" ? "bg-accent text-accent-foreground" : ""
          }`}
        >
          <Link href="/post" className="flex items-center gap-3">
            <FileText className="w-4 h-4" />
            <span>Post</span>
          </Link>
        </Button>

        <Button
          asChild
          variant="ghost"
          className={`w-full justify-start hover:bg-accent hover:text-accent-foreground ${
            pathname === "/category" ? "bg-accent text-accent-foreground" : ""
          }`}
        >
          <Link href="/category" className="flex items-center gap-3">
            <LayoutGrid className="w-4 h-4" />
            <span>Category</span>
          </Link>
        </Button>

        <Button
          asChild
          variant="ghost"
          className={`w-full justify-start hover:bg-accent hover:text-accent-foreground ${
            pathname === "/users" ? "bg-accent text-accent-foreground" : ""
          }`}
        >
          <Link href="/users" className="flex items-center gap-3">
            <Users className="w-4 h-4" />
            <span>Users</span>
          </Link>
        </Button>

        <Button
          asChild
          variant="ghost"
          className={`w-full justify-start hover:bg-accent hover:text-accent-foreground ${
            pathname === "/forum-poll" ? "bg-accent text-accent-foreground" : ""
          }`}
        >
          <Link href="/forum-poll" className="flex items-center gap-3">
            <MessageSquare className="w-4 h-4" />
            <span>Forum & Poll</span>
          </Link>
        </Button>

        <Button
          asChild
          variant="ghost"
          className={`w-full justify-start hover:bg-accent hover:text-accent-foreground ${
            pathname === "/abuse-warned" ? "bg-accent text-accent-foreground" : ""
          }`}
        >
          <Link href="/abuse-warned" className="flex items-center gap-3">
            <AlertTriangle className="w-4 h-4" />
            <span>Abuse/Warned</span>
          </Link>
        </Button>

        <Button
          asChild
          variant="ghost"
          className={`w-full justify-start hover:bg-accent hover:text-accent-foreground ${
            pathname === "/suspended" ? "bg-accent text-accent-foreground" : ""
          }`}
        >
          <Link href="/suspended" className="flex items-center gap-3">
            <Ban className="w-4 h-4" />
            <span>Suspended</span>
          </Link>
        </Button>
      </nav>
    </div>
  )
} 
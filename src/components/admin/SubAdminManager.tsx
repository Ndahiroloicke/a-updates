"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import {
  Search,
  UserPlus,
  Shield,
  Edit,
  Trash2,
  Bell,
  Check,
  X,
  Crown,
  Building2,
  GraduationCap,
  Badge,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Fake data for demonstration
const FAKE_SUBADMINS = [
  {
    id: "1",
    username: "john_editor",
    displayName: "John Smith",
    email: "john.editor@example.com",
    role: "CONTENT_EDITOR",
    permissions: ["edit_content", "manage_users"],
    status: "active",
    lastActive: "2024-03-10T15:30:00",
  },
  {
    id: "2",
    username: "sarah_mod",
    displayName: "Sarah Johnson",
    email: "sarah.mod@example.com",
    role: "MODERATOR",
    permissions: ["moderate_comments", "manage_reports"],
    status: "active",
    lastActive: "2024-03-10T14:45:00",
  },
  {
    id: "3",
    username: "mike_support",
    displayName: "Mike Wilson",
    email: "mike.support@example.com",
    role: "SUPPORT_ADMIN",
    permissions: ["handle_support", "view_reports"],
    status: "inactive",
    lastActive: "2024-03-09T11:20:00",
  },
  {
    id: "4",
    username: "emma_content",
    displayName: "Emma Davis",
    email: "emma.content@example.com",
    role: "CONTENT_MANAGER",
    permissions: ["manage_content", "approve_posts"],
    status: "active",
    lastActive: "2024-03-10T16:15:00",
  },
];

const ROLES = {
  CONTENT_EDITOR: {
    label: "Content Editor",
    defaultPermissions: ["edit_content", "manage_users"],
  },
  MODERATOR: {
    label: "Moderator",
    defaultPermissions: ["moderate_comments", "manage_reports"],
  },
  SUPPORT_ADMIN: {
    label: "Support Admin",
    defaultPermissions: ["handle_support", "view_reports"],
  },
  CONTENT_MANAGER: {
    label: "Content Manager",
    defaultPermissions: ["manage_content", "approve_posts"],
  },
};

const ALL_PERMISSIONS = [
  { id: "edit_content", label: "Edit Content" },
  { id: "manage_users", label: "Manage Users" },
  { id: "moderate_comments", label: "Moderate Comments" },
  { id: "manage_reports", label: "Manage Reports" },
  { id: "handle_support", label: "Handle Support" },
  { id: "view_reports", label: "View Reports" },
  { id: "manage_content", label: "Manage Content" },
  { id: "approve_posts", label: "Approve Posts" },
];

export default function SubAdminManager() {
  const [subAdmins, setSubAdmins] = useState(FAKE_SUBADMINS);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const { toast } = useToast();

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    setSelectedPermissions(
      ROLES[role as keyof typeof ROLES].defaultPermissions,
    );
  };

  const handleAddSubAdmin = () => {
    toast({
      title: "Success",
      description: "Sub-admin added successfully",
    });
    setShowAddDialog(false);
  };

  const handleRemoveSubAdmin = (id: string) => {
    setSubAdmins(subAdmins.filter((admin) => admin.id !== id));
    toast({
      title: "Success",
      description: "Sub-admin removed successfully",
    });
  };

  const filteredSubAdmins = subAdmins.filter(
    (admin) =>
      admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-green-600">
          Sub-Admin Management
        </h2>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-green-100 text-green-600 hover:bg-green-200">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Sub-Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Add New Sub-Admin</DialogTitle>
              <DialogDescription className="text-gray-500">
                Create a new sub-admin account with specific roles and
                permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLES).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_PERMISSIONS.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={permission.id}
                        checked={selectedPermissions.includes(permission.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedPermissions([
                              ...selectedPermissions,
                              permission.id,
                            ]);
                          } else {
                            setSelectedPermissions(
                              selectedPermissions.filter(
                                (p) => p !== permission.id,
                              ),
                            );
                          }
                        }}
                      />
                      <label htmlFor={permission.id} className="text-sm">
                        {permission.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSubAdmin}>Add Sub-Admin</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search sub-admins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-gray-200 bg-white pl-9"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px] border border-gray-200 bg-white text-gray-900 hover:bg-gray-50">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent className="border border-gray-200 bg-white">
                <SelectItem
                  value="all"
                  className="text-gray-900 hover:bg-gray-50"
                >
                  All Roles
                </SelectItem>
                {Object.entries(ROLES).map(([key, value]) => (
                  <SelectItem
                    key={key}
                    value={key}
                    className="text-gray-900 hover:bg-gray-50"
                  >
                    {value.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="text-gray-600">Name</TableHead>
                  <TableHead className="text-gray-600">Role</TableHead>
                  <TableHead className="text-gray-600">Permissions</TableHead>
                  <TableHead className="text-gray-600">Status</TableHead>
                  <TableHead className="text-gray-600">Last Active</TableHead>
                  <TableHead className="text-right text-gray-600">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubAdmins.map((admin) => (
                  <TableRow key={admin.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">
                          {admin.displayName}
                        </p>
                        <p className="text-sm text-gray-500">{admin.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Shield className="mr-2 h-4 w-4 text-green-600" />
                        <span className="text-gray-900">
                          {ROLES[admin.role as keyof typeof ROLES].label}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {admin.permissions.map((permission) => (
                          <span
                            key={permission}
                            className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
                          >
                            {permission}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                          admin.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {admin.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-900">
                      {new Date(admin.lastActive).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 border-gray-200 p-0 hover:bg-gray-50"
                        >
                          <Edit className="h-4 w-4 text-gray-600" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 border-gray-200 p-0 text-red-600 hover:bg-red-50"
                          onClick={() => handleRemoveSubAdmin(admin.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
    
    </div>
  );
}

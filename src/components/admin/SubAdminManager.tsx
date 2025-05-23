"use client";

import { useEffect, useState } from "react";
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
  Loader2,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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

interface SubAdmin {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  email: string;
  role: string;
  permissions: string[];
  status: string;
  lastActive: string;
}

interface User {
  id: string;
  username: string;
  displayName: string;
  email: string | null;
  avatarUrl: string | null;
  role: string;
}

export default function SubAdminManager() {
  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [editingSubAdmin, setEditingSubAdmin] = useState<SubAdmin | null>(null);
  const { toast } = useToast();

  // Cache for users to avoid repeated API calls
  const [usersCache, setUsersCache] = useState<User[]>([]);
  const [lastSearchTerm, setLastSearchTerm] = useState("");

  // Fetch all sub-admins on component mount
  useEffect(() => {
    fetchSubAdmins();
  }, []);

  // Fetch all sub-admins
  const fetchSubAdmins = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/subadmins");
      
      if (!response.ok) {
        throw new Error("Failed to fetch sub-admins");
      }
      
      const data = await response.json();
      setSubAdmins(data);
    } catch (error) {
      console.error("Error fetching sub-admins:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load sub-admins. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle role change in the add sub-admin form
  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    setSelectedPermissions(
      ROLES[role as keyof typeof ROLES].defaultPermissions,
    );
  };

  // Search for users to add as sub-admin - with caching
  const searchUsers = async (query: string = "") => {
    try {
      // If we already did this exact search and have results, use cached results
      if (query === lastSearchTerm && usersCache.length > 0) {
        setSearchResults(usersCache);
        return;
      }
      
      setSearchingUsers(true);
      const response = await fetch(`/api/users/available?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error("Failed to search users");
      }
      
      const data = await response.json();
      
      // Store results in cache
      setUsersCache(data);
      setLastSearchTerm(query);
      
      // Filter out already selected users
      const filteredResults = data.filter(
        (user: User) => !selectedUsers.some(selected => selected.id === user.id)
      );
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error("Error searching users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search users. Please try again.",
      });
    } finally {
      setSearchingUsers(false);
    }
  };

  // Reset form when dialog is closed
  useEffect(() => {
    if (!showAddDialog) {
      setSelectedUsers([]);
      setSelectedRole("");
      setSelectedPermissions([]);
      setUserSearchTerm("");
    }
  }, [showAddDialog]);

  // Fetch users when the add dialog is opened
  useEffect(() => {
    if (showAddDialog) {
      searchUsers();
    }
  }, [showAddDialog]);

  // Handle user search input change - with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (showAddDialog) {
        searchUsers(userSearchTerm);
      }
    }, 200); // Reduced debounce time for faster searching
    
    return () => clearTimeout(timeoutId);
  }, [userSearchTerm, showAddDialog]);

  // Handle adding a user to selection
  const handleUserSelection = (user: User) => {
    if (!selectedUsers.some(selected => selected.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
      
      // Remove from search results
      setSearchResults(searchResults.filter(result => result.id !== user.id));
    }
  };

  // Handle removing a user from selection
  const handleRemoveUserSelection = (userId: string) => {
    // Get the user being removed
    const removedUser = selectedUsers.find(user => user.id === userId);
    
    // Remove from selected users
    setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
    
    // Add back to search results if it matches current search term
    if (removedUser && (
      userSearchTerm === "" || 
      removedUser.displayName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      removedUser.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      (removedUser.email && removedUser.email.toLowerCase().includes(userSearchTerm.toLowerCase()))
    )) {
      setSearchResults([...searchResults, removedUser]);
    }
  };

  // Add multiple new sub-admins
  const handleAddSubAdmin = async () => {
    if (selectedUsers.length === 0) {
      toast({
        variant: "destructive",
        description: "Please select at least one user to add as sub-admin",
      });
      return;
    }
    
    if (!selectedRole) {
      toast({
        variant: "destructive",
        description: "Please select a role for the sub-admin(s)",
      });
      return;
    }
    
    try {
      setLoadingAction(true);
      
      const addedSubAdmins: SubAdmin[] = [];
      const failedUsers: string[] = [];
      
      // Process each selected user
      for (const user of selectedUsers) {
        try {
          const response = await fetch("/api/subadmins", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.id,
              subRole: selectedRole,
              permissions: selectedPermissions,
            }),
          });
          
          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Failed to add sub-admin");
          }
          
          const newSubAdmin = await response.json();
          addedSubAdmins.push(newSubAdmin);
        } catch (error) {
          console.error(`Error adding ${user.displayName} as sub-admin:`, error);
          failedUsers.push(user.displayName);
        }
      }
      
      // Update the list with the new sub-admins
      setSubAdmins([...addedSubAdmins, ...subAdmins]);
      
      // Show success message
      if (addedSubAdmins.length > 0) {
    toast({
      title: "Success",
          description: `Successfully added ${addedSubAdmins.length} sub-admin${addedSubAdmins.length > 1 ? 's' : ''}`,
        });
      }
      
      // Show error message for failed users
      if (failedUsers.length > 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to add ${failedUsers.join(', ')} as sub-admin${failedUsers.length > 1 ? 's' : ''}`,
        });
      }
      
      // Close dialog if all successful
      if (failedUsers.length === 0) {
    setShowAddDialog(false);
      }
    } catch (error) {
      console.error("Error adding sub-admins:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add sub-admins",
      });
    } finally {
      setLoadingAction(false);
    }
  };

  // Remove a sub-admin
  const handleRemoveSubAdmin = async (id: string) => {
    try {
      setLoadingAction(true);
      
      const response = await fetch(`/api/subadmins/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to remove sub-admin");
      }
      
      // Remove the sub-admin from the list
    setSubAdmins(subAdmins.filter((admin) => admin.id !== id));
      
    toast({
      title: "Success",
      description: "Sub-admin removed successfully",
    });
    } catch (error) {
      console.error("Error removing sub-admin:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove sub-admin",
      });
    } finally {
      setLoadingAction(false);
    }
  };

  // Filter sub-admins based on search term and role filter
  const filteredSubAdmins = subAdmins.filter(
    (admin) => {
      const matchesSearch = 
      admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === "all" || admin.role === roleFilter;
      
      return matchesSearch && matchesRole;
    }
  );

  // Handle edit button click
  const handleEditClick = (admin: SubAdmin) => {
    setEditingSubAdmin(admin);
    setSelectedRole(admin.role);
    setSelectedPermissions(admin.permissions);
    setShowEditDialog(true);
  };

  // Handle edit sub-admin submit
  const handleEditSubAdmin = async () => {
    if (!editingSubAdmin) return;
    
    try {
      setLoadingAction(true);
      
      const response = await fetch(`/api/subadmins/${editingSubAdmin.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subRole: selectedRole,
          permissions: selectedPermissions,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update sub-admin");
      }
      
      const updatedSubAdmin = await response.json();
      
      // Update the list with the edited sub-admin
      setSubAdmins(
        subAdmins.map((admin) => 
          admin.id === updatedSubAdmin.id ? updatedSubAdmin : admin
        )
      );
      
      toast({
        title: "Success",
        description: "Sub-admin updated successfully",
      });
      
      // Reset and close dialog
      setEditingSubAdmin(null);
      setSelectedRole("");
      setSelectedPermissions([]);
      setShowEditDialog(false);
    } catch (error) {
      console.error("Error updating sub-admin:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update sub-admin",
      });
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
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
          <DialogContent className="bg-white sm:max-w-[600px] w-[90vw] max-h-[90vh] overflow-y-auto scrollbar-hide">
            <DialogHeader>
              <DialogTitle>Add New Sub-Admin</DialogTitle>
              <DialogDescription className="text-gray-500">
                Create new sub-admin accounts with specific roles and
                permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* User Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Select Users <span className="text-xs text-muted-foreground">(Multiple selection allowed)</span>
                </label>
                
                {/* Selected Users Display */}
                {selectedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2 border rounded-md p-3 max-h-[80px] overflow-y-auto scrollbar-hide">
                    {selectedUsers.map(user => (
                      <div 
                        key={user.id}
                        className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-xs max-w-full"
                      >
                        <span className="truncate max-w-[150px]">{user.displayName}</span>
                        <button 
                          onClick={() => handleRemoveUserSelection(user.id)}
                          className="rounded-full hover:bg-gray-200 p-1 flex-shrink-0"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="relative">
                  <Input 
                    placeholder="Search for users..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full mb-2"
                  />
                  {searchingUsers && (
                    <div className="absolute right-2 top-2">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                  )}
                  <div className="border rounded-md max-h-[250px] overflow-y-auto scrollbar-hide">
                    {searchResults.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        {searchingUsers ? "Searching..." : userSearchTerm ? "No users found" : "No more users available"}
                      </div>
                    ) : (
                      <div className="p-1">
                        {searchResults.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center gap-3 p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleUserSelection(user)}
                          >
                            <User className="h-5 w-5 flex-shrink-0 text-gray-500" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{user.displayName}</p>
                              <p className="text-xs text-gray-500 truncate">{user.email || user.username}</p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex-shrink-0 h-8 px-2 py-1 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUserSelection(user);
                              }}
                            >
                              Select
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {selectedUsers.length > 0 && (
                  <p className="text-sm text-green-600">
                    {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
              
              {/* Role Selection */}
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
                <p className="text-xs text-muted-foreground">
                  All selected users will be assigned the same role and permissions
                </p>
              </div>
              
              {/* Permissions - Add Dialog */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Permissions</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {ALL_PERMISSIONS.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center space-x-2 bg-gray-50 rounded p-1"
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
            <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2 px-1 sm:justify-end">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto order-2 sm:order-1" 
                onClick={() => setShowAddDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddSubAdmin} 
                disabled={loadingAction || selectedUsers.length === 0 || !selectedRole}
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                {loadingAction ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  selectedUsers.length === 0 
                  ? "Add Sub-Admins" 
                  : `Add ${selectedUsers.length} Sub-Admin${selectedUsers.length !== 1 ? 's' : ''}`
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border bg-white shadow-sm w-full">
        <CardContent className="p-6 w-full">
          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search sub-admins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-gray-200 bg-white text-black pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
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

          <div className="rounded-md border border-gray-200 w-full">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <Table className="w-full">
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
                    {filteredSubAdmins.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          {searchTerm || roleFilter !== "all" 
                            ? "No sub-admins found matching your filters" 
                            : "No sub-admins have been added yet"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSubAdmins.map((admin) => (
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
                                {ROLES[admin.role as keyof typeof ROLES]?.label || admin.role}
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
                                onClick={() => handleEditClick(admin)}
                                disabled={loadingAction}
                        >
                                {loadingAction && editingSubAdmin?.id === admin.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                          <Edit className="h-4 w-4 text-gray-600" />
                                )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 border-gray-200 p-0 text-red-600 hover:bg-red-50"
                          onClick={() => handleRemoveSubAdmin(admin.id)}
                                disabled={loadingAction}
                        >
                                {loadingAction ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                          <Trash2 className="h-4 w-4" />
                                )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                      ))
                    )}
              </TableBody>
            </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Sub-Admin Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-white sm:max-w-[600px] w-[90vw] max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle>Edit Sub-Admin</DialogTitle>
            <DialogDescription className="text-gray-500">
              Update the role and permissions for this sub-admin.
            </DialogDescription>
          </DialogHeader>
          {editingSubAdmin && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">{editingSubAdmin.displayName}</p>
                  <p className="text-sm text-gray-500">{editingSubAdmin.email}</p>
                </div>
              </div>
              
              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={selectedRole} onValueChange={handleRoleChange}>
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
              
              {/* Permissions - Edit Dialog */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Permissions</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {ALL_PERMISSIONS.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center space-x-2 bg-gray-50 rounded p-1"
                    >
                      <Checkbox
                        id={`edit-${permission.id}`}
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
                      <label htmlFor={`edit-${permission.id}`} className="text-sm">
                        {permission.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2 px-1 sm:justify-end">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto order-2 sm:order-1"
              onClick={() => setShowEditDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditSubAdmin} 
              disabled={loadingAction || !selectedRole}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {loadingAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

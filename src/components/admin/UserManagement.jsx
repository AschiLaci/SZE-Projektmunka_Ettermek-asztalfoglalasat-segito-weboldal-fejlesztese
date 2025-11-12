import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAdmin } from "@/context/AdminContext";
import UserFormDialog from "./UserFormDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Star, Calendar, Clock, ShoppingCart, DollarSign, ChevronDown, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const UserManagement = () => {
  const { toast } = useToast();
  const { users, updateUserStatus, addUser, updateUser, deleteUser } = useAdmin();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [sortOption, setSortOption] = useState("name_asc");

  const userAccounts = useMemo(() => {
    const filteredUsers = users.filter(user => user.role === 'user');
    const sorted = [...filteredUsers];
    switch (sortOption) {
      case "name_asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name_desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "join_date_desc":
        sorted.sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));
        break;
      case "spent_desc":
        sorted.sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0));
        break;
      case "bookings_desc":
        sorted.sort((a, b) => (b.totalBookings || 0) - (a.totalBookings || 0));
        break;
      case "status":
        sorted.sort((a, b) => a.status.localeCompare(b.status));
        break;
      default:
        break;
    }
    return sorted;
  }, [users, sortOption]);

  const sortOptions = {
    name_asc: "Name (A-Z)",
    name_desc: "Name (Z-A)",
    join_date_desc: "Newest First",
    spent_desc: "Most Spent",
    bookings_desc: "Most Bookings",
    status: "Status",
  };

  const handleStatusChange = (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    updateUserStatus(id, newStatus);
    const userName = users.find(u => u.id === id)?.name;
    toast({
      title: "User Status Updated",
      description: `${userName}'s account is now ${newStatus}`,
      variant: newStatus === "suspended" ? "destructive" : "default",
    });
  };
  
  const handleDelete = (userId) => {
    deleteUser(userId);
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleSave = (userData) => {
    if (editingUser) {
      updateUser(editingUser.id, userData);
      toast({
        title: "User Updated",
        description: `${userData.name} has been successfully updated.`,
      });
    } else {
      addUser({...userData, role: 'user'});
      toast({
        title: "User Added",
        description: `${userData.name} has been successfully added.`,
      });
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">User Accounts</h2>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Sort: {sortOptions[sortOption]}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortOption("name_asc")}>Name (A-Z)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption("name_desc")}>Name (Z-A)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption("join_date_desc")}>Newest First</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption("spent_desc")}>Most Spent</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption("bookings_desc")}>Most Bookings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption("status")}>Status</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleAddNew}>Add New User</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userAccounts.map(user => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border bg-card p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{user.name}</h3>
                  <p className="text-sm font-bold text-muted-foreground">@{user.username || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground mt-2 flex items-center"><Calendar className="w-4 h-4 mr-2" />Joined: {user.joinDate}</p>
                  <p className="text-sm text-muted-foreground flex items-center"><Clock className="w-4 h-4 mr-2" />Last Active: {user.lastActive}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${
                    user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {user.status}
                  </span>
                </div>
              </div>
               <div className="flex gap-2 mb-4">
                  <Button
                    size="sm"
                    variant={user.status === "active" ? "destructive" : "default"}
                    onClick={() => handleStatusChange(user.id, user.status)}
                  >
                    {user.status === "active" ? "Suspend" : "Activate"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>Edit</Button>
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user account for {user.name}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(user.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <div className="border-t pt-4 mt-auto flex justify-between items-center text-sm text-muted-foreground">
              <div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400"/> {user.totalRatings || 0} Ratings</div>
              <div className="flex items-center gap-1"><ShoppingCart className="w-4 h-4 text-blue-400"/> {user.totalBookings || 0} Bookings</div>
              <div className="flex items-center gap-1"><DollarSign className="w-4 h-4 text-green-400"/> ${(user.totalSpent || 0).toLocaleString()}</div>
            </div>
          </motion.div>
        ))}
      </div>
      <UserFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        user={editingUser}
      />
    </div>
  );
};

export default UserManagement;
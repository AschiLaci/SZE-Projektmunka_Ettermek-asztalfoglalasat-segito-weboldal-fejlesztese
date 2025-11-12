import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAdmin } from "@/context/AdminContext";
import RestaurantFormDialog from "./RestaurantFormDialog";
import FloorPlanEditorDialog from "./FloorPlanEditorDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Map, Star, Users, BookOpen, DollarSign, ChevronDown, Trash2 } from "lucide-react";
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

const RestaurantManagement = () => {
  const { toast } = useToast();
  const { restaurants, updateRestaurantStatus, addRestaurant, updateRestaurant, updateRestaurantLayout, deleteUser } = useAdmin();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMapEditorOpen, setIsMapEditorOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [sortOption, setSortOption] = useState("name_asc");

  const sortedRestaurants = useMemo(() => {
    const sorted = [...restaurants];
    switch (sortOption) {
      case "name_asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name_desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "rating_desc":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "rating_asc":
        sorted.sort((a, b) => a.rating - b.rating);
        break;
      case "status":
        sorted.sort((a, b) => a.status.localeCompare(b.status));
        break;
      default:
        break;
    }
    return sorted;
  }, [restaurants, sortOption]);

  const sortOptions = {
    name_asc: "Name (A-Z)",
    name_desc: "Name (Z-A)",
    rating_desc: "Rating (High-Low)",
    rating_asc: "Rating (Low-High)",
    status: "Status",
  };
  
  const handleDelete = (userId) => {
    deleteUser(userId);
  };

  const handleStatusChange = (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    updateRestaurantStatus(id, newStatus);
    const restaurantName = restaurants.find(r => r.id === id)?.name;
    toast({
      title: "Restaurant Status Updated",
      description: `${restaurantName} is now ${newStatus}`,
    });
  };

  const handleAddNew = () => {
    setEditingRestaurant(null);
    setIsFormOpen(true);
  };

  const handleEdit = (restaurant) => {
    setEditingRestaurant(restaurant);
    setIsFormOpen(true);
  };

  const handleEditFloorPlan = (restaurant) => {
    setEditingRestaurant(restaurant);
    setIsMapEditorOpen(true);
  };

  const handleSave = (restaurantData) => {
    if (editingRestaurant) {
      updateRestaurant(editingRestaurant.id, restaurantData);
      toast({
        title: "Restaurant Updated",
        description: `${restaurantData.name} has been successfully updated.`,
      });
    } else {
      addRestaurant(restaurantData);
      toast({
        title: "Restaurant Added",
        description: `${restaurantData.name} has been successfully added.`,
      });
    }
    setIsFormOpen(false);
  };
  
  const handleSaveLayout = (layout) => {
    if (editingRestaurant) {
      updateRestaurantLayout(editingRestaurant.id, layout);
      toast({
        title: "Floor Plan Updated",
        description: `The floor plan for ${editingRestaurant.name} has been saved.`,
      });
    }
    setIsMapEditorOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Restaurants</h2>
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
              <DropdownMenuItem onClick={() => setSortOption("rating_desc")}>Rating (High-Low)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption("rating_asc")}>Rating (Low-High)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption("status")}>Status</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleAddNew}>Add New Restaurant</Button>
        </div>
      </div>

      <div className="space-y-4">
        {sortedRestaurants.map(restaurant => (
          <motion.div
            key={restaurant.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-lg border bg-card p-6 shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">{restaurant.name}</h3>
                <p className="text-sm font-bold text-muted-foreground">@{restaurant.username || 'N/A'}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${
                  restaurant.status === "active" ? "bg-green-100 text-green-800" : 
                  restaurant.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {restaurant.status}
                </span>
                <div className="flex flex-wrap gap-2">
                   <Button size="sm" variant="outline" onClick={() => handleEdit(restaurant)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Details
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEditFloorPlan(restaurant)}>
                    <Map className="mr-2 h-4 w-4" />
                    Floor Plan
                  </Button>
                  <Button
                    size="sm"
                    variant={restaurant.status === "active" ? "destructive" : "default"}
                    onClick={() => handleStatusChange(restaurant.id, restaurant.status)}
                  >
                    {restaurant.status === "active" ? "Suspend" : "Activate"}
                  </Button>
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
                            This action cannot be undone. This will permanently delete the restaurant account for {restaurant.name}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(restaurant.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="font-semibold">{restaurant.rating.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="font-semibold">{restaurant.currentlyOccupiedTables || 0}</p>
                  <p className="text-xs text-muted-foreground">Occupied Tables</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-400" />
                <div>
                  <p className="font-semibold">{restaurant.dailyBookings || 0}</p>
                  <p className="text-xs text-muted-foreground">Daily Bookings</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="font-semibold">${(restaurant.dailyRevenue || 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Daily Revenue</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <RestaurantFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        restaurant={editingRestaurant}
      />
       {editingRestaurant && (
        <FloorPlanEditorDialog
          isOpen={isMapEditorOpen}
          onClose={() => setIsMapEditorOpen(false)}
          onSave={handleSaveLayout}
          restaurantName={editingRestaurant.name}
          initialLayout={editingRestaurant.layout || []}
        />
      )}
    </div>
  );
};

export default RestaurantManagement;
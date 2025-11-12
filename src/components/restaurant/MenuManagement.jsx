import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRestaurant } from '@/context/RestaurantContext';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import MenuItemFormDialog from './MenuItemFormDialog';
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

const MenuManagement = ({ restaurantId }) => {
  const { restaurants, addMenuItem, updateMenuItem, deleteMenuItem } = useRestaurant();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const restaurant = restaurants.find(r => r.id === restaurantId);
  const menu = restaurant?.menu || [];

  const handleAddNew = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleSave = (itemData) => {
    if (editingItem) {
      updateMenuItem(restaurantId, editingItem.id, itemData);
      toast({ title: 'Menu Item Updated', description: `${itemData.name} has been updated.` });
    } else {
      addMenuItem(restaurantId, itemData);
      toast({ title: 'Menu Item Added', description: `${itemData.name} has been added to your menu.` });
    }
  };

  const handleDelete = (itemId) => {
    deleteMenuItem(restaurantId, itemId);
    toast({ title: 'Menu Item Deleted', variant: 'destructive' });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Menu Management</CardTitle>
              <CardDescription>Add, edit, or remove dishes from your menu.</CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {menu.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-md border p-4">
                <div>
                  <p className="font-semibold">{item.name} <span className="text-sm font-normal text-muted-foreground">- {item.category}</span></p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <p className="text-sm font-medium">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the menu item.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(item.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
            {menu.length === 0 && (
              <p className="text-center text-muted-foreground py-4">Your menu is empty. Add your first item!</p>
            )}
          </div>
        </CardContent>
      </Card>
      <MenuItemFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        item={editingItem}
      />
    </>
  );
};

export default MenuManagement;
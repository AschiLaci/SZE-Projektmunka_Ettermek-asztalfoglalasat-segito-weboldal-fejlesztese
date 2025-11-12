import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Trash2 } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

const UserFormDialog = ({ isOpen, onClose, onSave, user }) => {
  const { restaurants, deleteUserRating } = useAdmin();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    contactNumber: '',
    address: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [userRatings, setUserRatings] = useState([]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        contactNumber: user.contactNumber || '',
        address: user.address || '',
        newPassword: '',
        confirmPassword: '',
      });
      
      const ratings = [];
      restaurants.forEach(restaurant => {
        restaurant.reviews?.forEach(review => {
          if (review.userId === user.id) {
            ratings.push({ ...review, restaurantName: restaurant.name, restaurantId: restaurant.id });
          }
        });
      });
      setUserRatings(ratings);

    } else {
      setFormData({
        name: '',
        username: '',
        email: '',
        contactNumber: '',
        address: '',
        newPassword: '',
        confirmPassword: '',
      });
      setUserRatings([]);
    }
  }, [user, isOpen, restaurants]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "The new password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }
    
    const dataToSave = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        contactNumber: formData.contactNumber,
        address: formData.address,
    };

    if (formData.newPassword) {
        dataToSave.password = formData.newPassword;
    }

    onSave(dataToSave);
  };

  const handleDeleteRating = (rating) => {
    deleteUserRating(user.id, rating.restaurantId, rating.date);
    toast({
        title: "Rating Deleted",
        description: `The rating for ${rating.restaurantName} has been removed.`,
        variant: "destructive",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {user ? 'Update the details of the user.' : 'Enter the details for the new user.'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[70vh] p-4">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div><Label htmlFor="name">Full Name</Label><Input id="name" value={formData.name} onChange={handleChange} required /></div>
                            <div><Label htmlFor="username">Username</Label><Input id="username" value={formData.username} onChange={handleChange} required /></div>
                            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email} onChange={handleChange} required /></div>
                            <div><Label htmlFor="contactNumber">Contact Number</Label><Input id="contactNumber" type="tel" value={formData.contactNumber} onChange={handleChange} /></div>
                            <div><Label htmlFor="address">Address</Label><Input id="address" value={formData.address} onChange={handleChange} /></div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Password</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                           <div><Label htmlFor="newPassword">New Password</Label><Input id="newPassword" type="password" value={formData.newPassword} onChange={handleChange} placeholder={user ? "Leave blank to keep current password" : ""}/></div>
                           <div><Label htmlFor="confirmPassword">Confirm Password</Label><Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} /></div>
                        </CardContent>
                    </Card>
                </div>

                {user && (
                    <Card>
                        <CardHeader><CardTitle>User Ratings</CardTitle></CardHeader>
                        <CardContent>
                            {userRatings.length > 0 ? (
                                <div className="space-y-4">
                                    {userRatings.map((rating) => (
                                        <div key={`${rating.restaurantId}-${rating.date}`} className="border-b pb-2 flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold">{rating.restaurantName}</p>
                                                <div className="flex items-center">
                                                    {[...Array(5)].map((_, i) => (<Star key={i} className={`h-4 w-4 ${i < rating.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />))}
                                                    <span className="text-xs text-muted-foreground ml-2">{format(new Date(rating.date), 'PP')}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground italic">"{rating.comment}"</p>
                                            </div>
                                             <Button variant="ghost" size="icon" onClick={() => handleDeleteRating(rating)}>
                                                <Trash2 className="h-4 w-4 text-red-500"/>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-8">This user has not left any ratings yet.</p>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
          </form>
        </ScrollArea>
        <DialogFooter className="pt-4 pr-5">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleSubmit}>
              Save
            </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormDialog;
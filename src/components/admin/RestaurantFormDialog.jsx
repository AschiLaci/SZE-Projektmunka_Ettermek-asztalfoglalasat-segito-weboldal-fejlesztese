import React, { useState, useEffect, useMemo } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/components/ui/use-toast";
import { useAdmin } from "@/context/AdminContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Trash2, Clock, Ban } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { NumberInput } from '@/components/ui/number-input';
import { Switch } from '@/components/ui/switch';

const generateTimeSlots = (interval = 30) => {
    const slots = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += interval) {
            const hour = h.toString().padStart(2, '0');
            const minute = m.toString().padStart(2, '0');
            slots.push(`${hour}:${minute}`);
        }
    }
    return slots;
};

const bookingThresholds = [15, 30, 45, 60];

const RestaurantFormDialog = ({ isOpen, onClose, onSave, restaurant }) => {
  const { toast } = useToast();
  const { users, updateRestaurant } = useAdmin();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    cuisine: '',
    address: '',
    description: '',
    password: '',
    openingTime: '',
    closingTime: '',
    firstBookingTime: '',
    lastBookingTime: '',
    bookingThreshold: 30,
    maxBookingsPerSlot: 1,
    bookingsDisabled: false,
  });
  const [tableCount, setTableCount] = useState(0);

  const timeSlots = useMemo(() => generateTimeSlots(30), []);
  const bookingTimeSlots = useMemo(() => generateTimeSlots(formData.bookingThreshold), [formData.bookingThreshold]);

  useEffect(() => {
    if (restaurant) {
      const [openingTime, closingTime] = (restaurant.openingHours || " - ").split(' - ');
      const count = (restaurant.layout || []).filter(item => item.type === 'table').length;
      setTableCount(count);
      
      setFormData({
        name: restaurant.name || '',
        username: restaurant.username || '',
        cuisine: restaurant.cuisine || '',
        address: restaurant.address || '',
        description: restaurant.description || '',
        openingTime: openingTime.trim(),
        closingTime: closingTime.trim(),
        firstBookingTime: restaurant.firstBookingTime || openingTime.trim() || '',
        lastBookingTime: restaurant.lastBookingTime || closingTime.trim() || '',
        bookingThreshold: restaurant.bookingThreshold || 30,
        maxBookingsPerSlot: restaurant.maxBookingsPerSlot ?? count,
        bookingsDisabled: restaurant.bookingsDisabled || false,
        password: '',
      });
    } else {
      setTableCount(0);
      setFormData({
        name: '',
        username: '',
        cuisine: '',
        address: '',
        description: '',
        openingTime: '',
        closingTime: '',
        firstBookingTime: '',
        lastBookingTime: '',
        bookingThreshold: 30,
        maxBookingsPerSlot: 0,
        bookingsDisabled: false,
        password: '',
      });
    }
  }, [restaurant, isOpen]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleNumberChange = (id, value) => {
    let numericValue = Number(value);
    if (id === 'maxBookingsPerSlot') {
      if (numericValue > tableCount) {
        numericValue = tableCount;
        toast({
          title: "Limit Exceeded",
          description: `Max bookings cannot exceed the number of tables (${tableCount}).`,
          variant: "destructive",
        });
      }
      if (tableCount > 0 && numericValue < 1) {
        numericValue = 1;
        toast({
          title: "Minimum Value",
          description: "Available tables per slot cannot be less than 1 if tables exist.",
          variant: "destructive",
        });
      } else if (tableCount === 0 && numericValue < 0) {
        numericValue = 0;
      }
    }
    setFormData((prev) => ({ ...prev, [id]: numericValue }));
  };

  const handleTimeChange = (field, value) => {
    setFormData((prev) => {
      const newFormData = { ...prev, [field]: value };

      if (field === 'openingTime') {
        if (newFormData.closingTime && value >= newFormData.closingTime) {
          newFormData.closingTime = '';
          toast({ title: "Time Conflict", description: "Opening time must be before closing time. Closing time has been reset.", variant: "destructive" });
        }
        if (!newFormData.firstBookingTime || newFormData.firstBookingTime < value) {
          newFormData.firstBookingTime = value;
        }
      }
      if (field === 'closingTime' && newFormData.openingTime && value <= newFormData.openingTime) {
        toast({ title: "Invalid Time", description: "Closing time must be after opening time.", variant: "destructive" });
        return prev;
      }
      if (field === 'closingTime') {
        if (!newFormData.lastBookingTime || newFormData.lastBookingTime > value) {
          newFormData.lastBookingTime = value;
        }
      }

      if (field === 'firstBookingTime') {
        if (newFormData.lastBookingTime && value >= newFormData.lastBookingTime) {
          newFormData.lastBookingTime = '';
          toast({ title: "Time Conflict", description: "First booking time must be before last booking time. Last booking time has been reset.", variant: "destructive" });
        }
      }
      if (field === 'lastBookingTime' && newFormData.firstBookingTime && value <= newFormData.firstBookingTime) {
        toast({ title: "Invalid Time", description: "Last booking time must be after first booking time.", variant: "destructive" });
        return prev;
      }

      return newFormData;
    });
  };

  const handleThresholdChange = (value) => {
    setFormData((prev) => ({ ...prev, bookingThreshold: value, firstBookingTime: '', lastBookingTime: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { openingTime, closingTime, ...restOfData } = formData;
    const dataToSave = { 
      ...restOfData,
      openingHours: `${openingTime || ''} - ${closingTime || ''}`,
      firstBookingTime: formData.firstBookingTime || openingTime || '',
      lastBookingTime: formData.lastBookingTime || closingTime || '',
      maxBookingsPerSlot: Number(formData.maxBookingsPerSlot) || (tableCount > 0 ? 1 : 0),
      bookingThreshold: Number(formData.bookingThreshold) || 30,
      bookingsDisabled: formData.bookingsDisabled || false,
    };
    if (!dataToSave.password) {
      delete dataToSave.password;
    }
    onSave(dataToSave);
  };
  
  const handleDeleteReview = (reviewDate) => {
    if(!restaurant) return;
    const updatedReviews = restaurant.reviews.filter(r => r.date !== reviewDate);
    updateRestaurant(restaurant.id, { ...restaurant, reviews: updatedReviews });
    toast({
      title: "Review Deleted",
      description: "The review has been successfully removed.",
      variant: "destructive"
    });
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : "Anonymous";
  }

  const filteredBookingTimeSlots = useMemo(() => {
    if (!formData.openingTime || !formData.closingTime) return bookingTimeSlots;
    return bookingTimeSlots.filter(t => t >= formData.openingTime && t <= formData.closingTime);
  }, [bookingTimeSlots, formData.openingTime, formData.closingTime]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{restaurant ? 'Edit Restaurant' : 'Add New Restaurant'}</DialogTitle>
          <DialogDescription>
            {restaurant ? 'Update the details and manage reviews for the restaurant.' : 'Enter the details for the new restaurant.'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[70vh] p-4">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>Restaurant Details</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" value={formData.username} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cuisine">Cuisine Type</Label>
                      <Input id="cuisine" value={formData.cuisine} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" value={formData.address} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" value={formData.description} onChange={handleChange} />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Operational Settings</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <Label htmlFor="bookingsDisabled" className="text-base">Disable Bookings</Label>
                        <p className="text-sm text-muted-foreground">Turn this on to prevent new reservations.</p>
                      </div>
                      <Switch
                        id="bookingsDisabled"
                        checked={formData.bookingsDisabled}
                        onCheckedChange={(checked) => setFormData({ ...formData, bookingsDisabled: checked })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Opening Hours</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-full justify-start", !formData.openingTime && "text-muted-foreground")}>
                              <Clock className="mr-2 h-4 w-4" /> {formData.openingTime || "Opening"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <ScrollArea className="h-60"><div className="grid grid-cols-3 gap-1 p-2">{timeSlots.map(t => (<Button key={`open-${t}`} type="button" variant={formData.openingTime === t ? "default" : "outline"} onClick={() => handleTimeChange('openingTime', t)}>{t}</Button>))}</div></ScrollArea>
                          </PopoverContent>
                        </Popover>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-full justify-start", !formData.closingTime && "text-muted-foreground")}>
                              <Clock className="mr-2 h-4 w-4" /> {formData.closingTime || "Closing"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <ScrollArea className="h-60"><div className="grid grid-cols-3 gap-1 p-2">{timeSlots.map(t => (<Button key={`close-${t}`} type="button" variant={formData.closingTime === t ? "default" : "outline"} onClick={() => handleTimeChange('closingTime', t)}>{t}</Button>))}</div></ScrollArea>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bookingThreshold">Booking Threshold (minutes)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant={"outline"} className="w-full justify-start">
                            <Clock className="mr-2 h-4 w-4" /> {formData.bookingThreshold} minutes
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <div className="grid grid-cols-2 gap-1 p-2">
                            {bookingThresholds.map(t => (<Button key={`threshold-${t}`} type="button" variant={formData.bookingThreshold === t ? "default" : "outline"} onClick={() => handleThresholdChange(t)}>{t} min</Button>))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstBookingTime">First Booking Time</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-full justify-start", !formData.firstBookingTime && "text-muted-foreground")}>
                              <Clock className="mr-2 h-4 w-4" /> {formData.firstBookingTime || "Select"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <ScrollArea className="h-60"><div className="grid grid-cols-3 gap-1 p-2">{filteredBookingTimeSlots.map(t => (<Button key={`first-${t}`} type="button" variant={formData.firstBookingTime === t ? "default" : "outline"} onClick={() => handleTimeChange('firstBookingTime', t)}>{t}</Button>))}</div></ScrollArea>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastBookingTime">Last Booking Time</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-full justify-start", !formData.lastBookingTime && "text-muted-foreground")}>
                              <Clock className="mr-2 h-4 w-4" /> {formData.lastBookingTime || "Select"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <ScrollArea className="h-60"><div className="grid grid-cols-3 gap-1 p-2">{filteredBookingTimeSlots.map(t => (<Button key={`last-${t}`} type="button" variant={formData.lastBookingTime === t ? "default" : "outline"} onClick={() => handleTimeChange('lastBookingTime', t)}>{t}</Button>))}</div></ScrollArea>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxBookingsPerSlot">Available Tables per Slot (Total: {tableCount})</Label>
                      <NumberInput
                        id="maxBookingsPerSlot"
                        value={formData.maxBookingsPerSlot}
                        onChange={(e) => handleNumberChange('maxBookingsPerSlot', e.target.value)}
                        min={tableCount > 0 ? 1 : 0}
                        max={tableCount}
                        placeholder="e.g., 10"
                      />
                    </div>
                  </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Security</CardTitle></CardHeader>
                    <CardContent>
                         <div className="space-y-2">
                          <Label htmlFor="password">New Password</Label>
                          <Input id="password" type="password" placeholder={restaurant ? 'Leave blank to keep current password' : ''} onChange={handleChange} />
                        </div>
                    </CardContent>
                </Card>
              </div>

              {restaurant && (
                <Card>
                  <CardHeader><CardTitle>Ratings & Reviews</CardTitle></CardHeader>
                  <CardContent>
                    {restaurant.reviews && restaurant.reviews.length > 0 ? (
                      <div className="space-y-4">
                          {restaurant.reviews.map((review, index) => (
                            <div key={`${review.date}-${index}`} className="border-b pb-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-semibold">{getUserName(review.userId)}</p>
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (<Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />))}
                                    <span className="text-xs text-muted-foreground ml-2">{format(new Date(review.date), 'PP')}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground italic mt-1">"{review.comment}"</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteReview(review.date)}>
                                  <Trash2 className="h-4 w-4 text-red-500"/>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                    ) : (
                      <p className="text-sm text-center text-muted-foreground py-8">No reviews yet for this restaurant.</p>
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
              Save Changes
            </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RestaurantFormDialog;
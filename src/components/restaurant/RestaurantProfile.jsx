import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Upload, Save, Clock, Ban } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MapEditor from "@/components/restaurant/map-editor/MapEditor";
import { useRestaurant } from "@/context/RestaurantContext";
import RestaurantActivityLog from "./RestaurantActivityLog";
import MenuManagement from "./MenuManagement";
import { useAdmin } from "@/context/AdminContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NumberInput } from "@/components/ui/number-input";
import { Switch } from "@/components/ui/switch";

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

const RestaurantProfile = ({ onLogout }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user: loggedInUser } = useAdmin();
  const { restaurants, updateRestaurantDetails, getLayoutForRestaurant, updateLayout } = useRestaurant();
  
  const [profile, setProfile] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentLayout, setCurrentLayout] = useState([]);
  const [tableCount, setTableCount] = useState(0);

  const timeSlots = useMemo(() => generateTimeSlots(30), []);
  const bookingTimeSlots = useMemo(() => {
    if (!profile) return [];
    return generateTimeSlots(profile.bookingThreshold);
  }, [profile?.bookingThreshold]);
  
  const restaurantId = loggedInUser?.id;

  useEffect(() => {
    if (restaurantId) {
      const restaurantData = restaurants.find(r => r.id === restaurantId);
      const layoutData = getLayoutForRestaurant(restaurantId);
      const count = layoutData.filter(item => item.type === 'table').length;
      setCurrentLayout(layoutData);
      setTableCount(count);

      if (restaurantData) {
        const [openingTime, closingTime] = (restaurantData.openingHours || " - ").split(' - ');
        
        setProfile({
          ...restaurantData,
          openingTime: openingTime.trim(),
          closingTime: closingTime.trim(),
          firstBookingTime: restaurantData.firstBookingTime || openingTime.trim() || '',
          lastBookingTime: restaurantData.lastBookingTime || closingTime.trim() || '',
          bookingThreshold: restaurantData.bookingThreshold || 30,
          maxBookingsPerSlot: restaurantData.maxBookingsPerSlot ?? count,
          bookingsDisabled: count === 0 ? true : (restaurantData.bookingsDisabled || false),
        });
        setBannerImage(restaurantData.image);
      }
    }
  }, [restaurants, getLayoutForRestaurant, restaurantId]);

  const filteredBookingTimeSlots = useMemo(() => {
    if (!profile || !profile.openingTime || !profile.closingTime) return bookingTimeSlots;
    return bookingTimeSlots.filter(t => t >= profile.openingTime && t <= profile.closingTime);
  }, [bookingTimeSlots, profile?.openingTime, profile?.closingTime]);

  const handleLayoutChange = (newLayout) => {
    const newTableCount = newLayout.filter(item => item.type === 'table').length;
    setCurrentLayout(newLayout);
    setTableCount(newTableCount);

    setProfile(prevProfile => {
      const updatedMaxBookings = Math.min(prevProfile.maxBookingsPerSlot, newTableCount);
      return {
        ...prevProfile,
        maxBookingsPerSlot: updatedMaxBookings,
        bookingsDisabled: newTableCount === 0 ? true : prevProfile.bookingsDisabled,
      };
    });
  };
  
  const saveLayout = () => {
    updateLayout(restaurantId, currentLayout);
    toast({
      title: "Layout Saved!",
      description: "Your new floor plan has been saved successfully.",
    });
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setProfile({ ...profile, [id]: value });
  };

  const handleNumberInputChange = (id, value) => {
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
      if (numericValue < 1 && tableCount > 0) {
        numericValue = 1;
      } else if (tableCount === 0) {
        numericValue = 0;
      }
    }
    setProfile({ ...profile, [id]: numericValue });
  };

  const handleTimeChange = (field, value) => {
    setProfile(prev => {
      const newProfile = { ...prev, [field]: value };

      if (field === 'openingTime') {
        if (newProfile.closingTime && value >= newProfile.closingTime) {
          newProfile.closingTime = '';
          toast({ title: "Time Conflict", description: "Opening time must be before closing time. Closing time has been reset.", variant: "destructive" });
        }
        if (!newProfile.firstBookingTime || newProfile.firstBookingTime < value) {
          newProfile.firstBookingTime = value;
        }
      }
      if (field === 'closingTime' && newProfile.openingTime && value <= newProfile.openingTime) {
        toast({ title: "Invalid Time", description: "Closing time must be after opening time.", variant: "destructive" });
        return prev;
      }
      if (field === 'closingTime') {
        if (!newProfile.lastBookingTime || newProfile.lastBookingTime > value) {
          newProfile.lastBookingTime = value;
        }
      }

      if (field === 'firstBookingTime') {
        if (newProfile.lastBookingTime && value >= newProfile.lastBookingTime) {
          newProfile.lastBookingTime = '';
          toast({ title: "Time Conflict", description: "First booking time must be before last booking time. Last booking time has been reset.", variant: "destructive" });
        }
      }
      if (field === 'lastBookingTime' && newProfile.firstBookingTime && value <= newProfile.firstBookingTime) {
        toast({ title: "Invalid Time", description: "Last booking time must be after first booking time.", variant: "destructive" });
        return prev;
      }

      return newProfile;
    });
  };

  const handleThresholdChange = (value) => {
    setProfile({ ...profile, bookingThreshold: value, firstBookingTime: '', lastBookingTime: '' });
  };

  const handleDescriptionChange = (e) => {
    setProfile({ ...profile, description: e.target.value });
  };

  const handleBannerChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const newImageURL = URL.createObjectURL(e.target.files[0]);
      setBannerImage(newImageURL);
      setProfile({...profile, image: newImageURL});
      toast({
        title: "Banner Image Selected",
        description: "Click 'Save Changes' to apply the new banner.",
      });
    }
  };

  const handleSave = () => {
    if (!restaurantId || !profile) return;
    const { openingTime, closingTime, ...restOfProfile } = profile;
    const updatedProfile = {
      ...restOfProfile,
      openingHours: `${openingTime || ''} - ${closingTime || ''}`,
      firstBookingTime: profile.firstBookingTime || openingTime || '',
      lastBookingTime: profile.lastBookingTime || closingTime || '',
      maxBookingsPerSlot: Number(profile.maxBookingsPerSlot) || (tableCount > 0 ? 1 : 0),
      bookingThreshold: Number(profile.bookingThreshold) || 30,
      bookingsDisabled: tableCount === 0 ? true : profile.bookingsDisabled,
    };
    updateRestaurantDetails(restaurantId, updatedProfile);
    toast({
      title: "Profile Updated",
      description: "Your restaurant's information has been saved.",
    });
  };
  
  const handlePasswordChange = () => {
    if (!currentPassword) {
        toast({
            title: "Current Password Required",
            description: "Please enter your current password.",
            variant: "destructive",
        });
        return;
    }
    if (newPassword && newPassword === confirmPassword) {
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast({
        title: "Password Mismatch",
        description: "Please ensure the new password fields match.",
        variant: "destructive",
      });
    }
  };
  
  if (!profile) {
    return <div className="flex h-screen items-center justify-center"><p>Loading profile...</p></div>
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-7xl"
      >
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
                <Button onClick={() => navigate('/restaurant')} variant="ghost" className="mb-2">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Restaurant Profile</h1>
                <p className="text-muted-foreground">Manage your restaurant's public details, settings, and floor plan.</p>
            </div>
            <Button onClick={onLogout} variant="outline">
              Logout
            </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Restaurant Information</CardTitle>
                <CardDescription>Update your restaurant's details here.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Banner Image</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md border bg-muted">
                      {bannerImage ? (
                        <img  src={bannerImage} alt="Banner Preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Upload />
                        </div>
                      )}
                    </div>
                    <Input id="banner-upload" type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
                    <Button asChild variant="outline">
                      <Label htmlFor="banner-upload" className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Image
                      </Label>
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Restaurant Name</Label>
                    <Input id="name" value={profile.name} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" value={profile.username} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cuisine">Cuisine Type</Label>
                  <Input id="cuisine" value={profile.cuisine} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={profile.address} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={profile.description} onChange={handleDescriptionChange} placeholder="Tell customers about your restaurant..." />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSave}>Save Changes</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Operational Settings</CardTitle>
                <CardDescription>Manage opening hours and booking capacity.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <Label htmlFor="bookingsDisabled" className="text-base">Disable Bookings</Label>
                    <CardDescription>
                      {tableCount === 0 ? "Bookings are disabled until at least one table is added." : "Turn this on to prevent new reservations."}
                    </CardDescription>
                  </div>
                  <Switch
                    id="bookingsDisabled"
                    checked={profile.bookingsDisabled}
                    onCheckedChange={(checked) => setProfile({ ...profile, bookingsDisabled: checked })}
                    disabled={tableCount === 0}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Opening Hours</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("w-full justify-start", !profile.openingTime && "text-muted-foreground")}>
                          <Clock className="mr-2 h-4 w-4" /> {profile.openingTime || "Opening Time"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <ScrollArea className="h-60">
                          <div className="grid grid-cols-3 gap-1 p-2">
                            {timeSlots.map(t => (<Button key={`open-${t}`} variant={profile.openingTime === t ? "default" : "outline"} onClick={() => handleTimeChange('openingTime', t)}>{t}</Button>))}
                          </div>
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("w-full justify-start", !profile.closingTime && "text-muted-foreground")}>
                          <Clock className="mr-2 h-4 w-4" /> {profile.closingTime || "Closing Time"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <ScrollArea className="h-60">
                          <div className="grid grid-cols-3 gap-1 p-2">
                            {timeSlots.map(t => (<Button key={`close-${t}`} variant={profile.closingTime === t ? "default" : "outline"} onClick={() => handleTimeChange('closingTime', t)}>{t}</Button>))}
                          </div>
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bookingThreshold">Booking Threshold (minutes)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className="w-full justify-start">
                        <Clock className="mr-2 h-4 w-4" /> {profile.bookingThreshold} minutes
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <div className="grid grid-cols-2 gap-1 p-2">
                        {bookingThresholds.map(t => (<Button key={`threshold-${t}`} variant={profile.bookingThreshold === t ? "default" : "outline"} onClick={() => handleThresholdChange(t)}>{t} min</Button>))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstBookingTime">First Booking Time</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("w-full justify-start", !profile.firstBookingTime && "text-muted-foreground")}>
                          <Clock className="mr-2 h-4 w-4" /> {profile.firstBookingTime || "Select Time"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <ScrollArea className="h-60">
                          <div className="grid grid-cols-3 gap-1 p-2">
                            {filteredBookingTimeSlots.map(t => (<Button key={`first-${t}`} variant={profile.firstBookingTime === t ? "default" : "outline"} onClick={() => handleTimeChange('firstBookingTime', t)}>{t}</Button>))}
                          </div>
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastBookingTime">Last Booking Time</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("w-full justify-start", !profile.lastBookingTime && "text-muted-foreground")}>
                          <Clock className="mr-2 h-4 w-4" /> {profile.lastBookingTime || "Select Time"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <ScrollArea className="h-60">
                          <div className="grid grid-cols-3 gap-1 p-2">
                            {filteredBookingTimeSlots.map(t => (<Button key={`last-${t}`} variant={profile.lastBookingTime === t ? "default" : "outline"} onClick={() => handleTimeChange('lastBookingTime', t)}>{t}</Button>))}
                          </div>
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxBookingsPerSlot">Available Tables per Slot (Total: {tableCount})</Label>
                  <NumberInput
                    id="maxBookingsPerSlot"
                    value={profile.maxBookingsPerSlot}
                    onChange={(e) => handleNumberInputChange('maxBookingsPerSlot', e.target.value)}
                    min={tableCount > 0 ? 1 : 0}
                    max={tableCount}
                    placeholder="e.g., 10"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSave}>Save Settings</Button>
              </CardFooter>
            </Card>

            <MenuManagement restaurantId={restaurantId} />

            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password here.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handlePasswordChange}>Update Password</Button>
              </CardFooter>
            </Card>
            
            <Card className="lg:col-span-2">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Floor Plan Editor</CardTitle>
                            <CardDescription>Design your restaurant's layout. Drag, drop, and resize elements.</CardDescription>
                        </div>
                        <Button onClick={saveLayout}>
                            <Save className="mr-2 h-4 w-4" />
                            Save Layout
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="h-[600px] p-0 sm:h-[700px]">
                    <MapEditor layout={currentLayout} onLayoutChange={handleLayoutChange} />
                </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <RestaurantActivityLog restaurantId={restaurantId} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RestaurantProfile;
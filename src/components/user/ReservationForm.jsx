import React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Calendar as CalendarIcon, Users, Minus, Plus, Clock, ShieldCheck, Ban } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useRestaurant } from "@/context/RestaurantContext";
import ReservationConfirmationDialog from "./ReservationConfirmationDialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const generateTimeSlots = (start, end, interval = 30) => {
  if (!start || !end) return [];
  const slots = [];
  let currentTime = new Date(`1970-01-01T${start}:00`);
  const endTime = new Date(`1970-01-01T${end}:00`);

  while (currentTime <= endTime) {
    slots.push(currentTime.toTimeString().substring(0, 5));
    currentTime.setMinutes(currentTime.getMinutes() + interval);
  }
  return slots;
};

const ReservationForm = ({ restaurant, user }) => {
  const { toast } = useToast();
  const { addReservation, getBookingsForRestaurant } = useRestaurant();
  const [reservationDate, setReservationDate] = useState(null);
  const [reservationTime, setReservationTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [specialRequests, setSpecialRequests] = useState("");
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [bookingsForDay, setBookingsForDay] = useState([]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setContactNumber(user.contactNumber || "");
    }
  }, [user]);

  useEffect(() => {
    if (restaurant) {
      const firstBooking = restaurant.firstBookingTime;
      const lastBooking = restaurant.lastBookingTime;
      const threshold = restaurant.bookingThreshold || 30;
      
      if (firstBooking && lastBooking) {
        const slots = generateTimeSlots(firstBooking, lastBooking, threshold);
        setAvailableTimes(slots);
      } else {
        setAvailableTimes([]);
      }
    }
  }, [restaurant]);

  useEffect(() => {
    if (reservationDate && restaurant) {
      const allBookings = getBookingsForRestaurant(restaurant.id);
      const filteredBookings = allBookings.filter(
        b => b.date === format(reservationDate, "yyyy-MM-dd") && b.status !== 'cancelled' && b.status !== 'denied'
      );
      setBookingsForDay(filteredBookings);
    } else {
      setBookingsForDay([]);
    }
  }, [reservationDate, restaurant, getBookingsForRestaurant]);

  const handleReservationAttempt = (e) => {
    e.preventDefault();
    if (!reservationDate || !reservationTime || !name || !contactNumber) {
        toast({
            title: "Incomplete Information",
            description: "Please fill in all fields for your reservation.",
            variant: "destructive",
        });
        return;
    }

    setIsConfirming(true);
  };

  const handleConfirmReservation = () => {
    addReservation(restaurant.id, {
        userId: user?.id,
        restaurantName: restaurant.name,
        name,
        contact: contactNumber,
        date: format(reservationDate, "yyyy-MM-dd"),
        time: reservationTime,
        guests,
        specialRequests
    });

    setIsConfirming(false);
    setReservationDate(null);
    setReservationTime("");
    setGuests(2);
    setSpecialRequests("");
    if (!user) {
      setName("");
      setContactNumber("");
    }
  };

  const reservationDetails = {
    restaurantName: restaurant.name,
    date: reservationDate ? format(reservationDate, "PPP") : 'N/A',
    time: reservationTime,
    guests,
    name,
    contact: contactNumber,
  };

  const isTimeSlotFull = (time) => {
    if (!restaurant || !restaurant.maxBookingsPerSlot || restaurant.maxBookingsPerSlot <= 0) {
      return false;
    }
    const bookingsAtTime = bookingsForDay.filter(b => b.time === time).length;
    return bookingsAtTime >= restaurant.maxBookingsPerSlot;
  };

  if (restaurant.bookingsDisabled) {
    return (
      <div className="rounded-lg border bg-card p-6 shadow-sm flex flex-col items-center justify-center text-center h-full">
        <Ban className="h-12 w-12 text-destructive mb-4" />
        <h2 className="mb-2 text-xl font-semibold">Bookings Currently Unavailable</h2>
        <p className="text-muted-foreground">This restaurant is not accepting new reservations at this time. Please check back later.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Make a Reservation</h2>
        <form onSubmit={handleReservationAttempt} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="name">Full Name</label>
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" disabled={!!user} />
            </div>
            <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="contactNumber">Contact Number</label>
                  <Input id="contactNumber" value={contactNumber} onChange={e => setContactNumber(e.target.value)} placeholder="+1234567890" disabled={!!user} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                  <label className="text-sm font-medium">Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1",
                          !reservationDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {reservationDate ? format(reservationDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={reservationDate}
                        onSelect={(date) => {
                          setReservationDate(date);
                          setReservationTime("");
                        }}
                        initialFocus
                        disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                      />
                    </PopoverContent>
                  </Popover>
              </div>
              <div>
                  <label className="text-sm font-medium">Time</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1",
                          !reservationTime && "text-muted-foreground"
                        )}
                        disabled={!reservationDate || availableTimes.length === 0}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        {reservationTime || <span>Pick a time</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      {availableTimes.length > 0 ? (
                        <ScrollArea className="h-60">
                          <div className="grid grid-cols-3 gap-2 p-2">
                              {availableTimes.map(time => {
                                const isFull = isTimeSlotFull(time);
                                return (
                                  <Button 
                                      key={time}
                                      variant={reservationTime === time ? "default" : "outline"}
                                      onClick={() => setReservationTime(time)}
                                      disabled={isFull}
                                      className={cn(isFull && "text-muted-foreground line-through")}
                                  >
                                      {time}
                                  </Button>
                                );
                              })}
                          </div>
                        </ScrollArea>
                      ) : (
                        <div className="p-4 text-sm text-muted-foreground">
                          This restaurant has not set its booking times.
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
              </div>
          </div>
          <div>
            <label className="text-sm font-medium">Number of Guests</label>
            <div className="mt-1 flex items-center gap-2">
                <Button type="button" variant="outline" size="icon" onClick={() => setGuests(g => Math.max(1, g - 1))}>
                    <Minus className="h-4 w-4" />
                </Button>
                <div className="flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{guests} Guest{guests > 1 ? 's' : ''}</span>
                </div>
                <Button type="button" variant="outline" size="icon" onClick={() => setGuests(g => Math.min(10, g + 1))}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Special Requests</label>
            <Input
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="e.g. window seat, allergies"
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Securely Reserve Table
          </Button>
        </form>
      </div>
      <ReservationConfirmationDialog
        isOpen={isConfirming}
        onClose={() => setIsConfirming(false)}
        onConfirm={handleConfirmReservation}
        reservationDetails={reservationDetails}
      />
    </>
  );
};

export default ReservationForm;
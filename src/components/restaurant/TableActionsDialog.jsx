import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { PlusCircle, Users, Clock, Calendar as CalendarIcon, Hash, UtensilsCrossed, CheckCircle, Ban, UserPlus } from "lucide-react";
import { useRestaurant } from "@/context/RestaurantContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useAdmin } from "@/context/AdminContext";
import { NumberInput } from "@/components/ui/number-input";

const availableTimes = [
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", 
    "20:00", "20:30", "21:00", "21:30", "22:00"
];

const ReservationSubForm = ({ tableNumber, restaurantId, onReserve, onCancel }) => {
    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [guests, setGuests] = useState(2);
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState("");

    const handleSubmit = () => {
        if(name && contact && date && time) {
            onReserve(restaurantId, { tableNumber, name, contact, guests, date: format(date, "yyyy-MM-dd"), time });
        }
    };

    return (
        <div className="space-y-4 pt-4">
             <DialogHeader>
                <DialogTitle>Add Walk-in for Table {tableNumber}</DialogTitle>
                <DialogDescription>Fill in the details for the walk-in customer.</DialogDescription>
            </DialogHeader>
            <Input placeholder="Guest Name" value={name} onChange={e => setName(e.target.value)} />
            <Input placeholder="Contact Number" value={contact} onChange={e => setContact(e.target.value)} />
            <NumberInput
                placeholder="Guests"
                value={guests}
                onChange={e => setGuests(parseInt(e.target.value, 10))}
                min={1}
                max={10}
            />
            <div className="grid grid-cols-2 gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn(!date && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} initialFocus /></PopoverContent>
                </Popover>
                 <Popover>
                  <PopoverTrigger asChild><Button variant={"outline"} disabled={!date} className={cn(!time && "text-muted-foreground")}><Clock className="mr-2 h-4 w-4" />{time || "Pick a time"}</Button></PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><div className="grid grid-cols-3 gap-1 p-2">{availableTimes.map(t => (<Button key={t} variant={time === t ? "default" : "outline"} onClick={() => setTime(t)}>{t}</Button>))}</div></PopoverContent>
                </Popover>
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button onClick={handleSubmit}>Create Walk-in</Button>
            </DialogFooter>
        </div>
    );
};

const OccupiedView = ({ table, booking, onAddOrderItem, menuItems }) => {
    const totalAmount = (booking.order || []).reduce((sum, item) => {
        const menuItem = menuItems.find(mi => mi.id === item.id);
        return sum + (menuItem ? menuItem.price : 0) * item.quantity;
    }, 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Booking Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center"><Hash className="w-4 h-4 mr-2 text-muted-foreground" /> <strong>Booking ID:</strong> {booking.id.slice(0,8)}</div>
              <div className="flex items-center"><Users className="w-4 h-4 mr-2 text-muted-foreground" /> <strong>Guest:</strong> {booking.name} ({booking.guests} people)</div>
              <div className="flex items-center"><CalendarIcon className="w-4 h-4 mr-2 text-muted-foreground" /> <strong>Date:</strong> {booking.date}</div>
              <div className="flex items-center"><Clock className="w-4 h-4 mr-2 text-muted-foreground" /> <strong>Time:</strong> {booking.time}</div>
            </div>
            
            <h4 className="font-semibold text-lg pt-4">Current Order</h4>
            <ScrollArea className="h-[200px] border rounded-md p-2">
              {(booking.order || []).length > 0 ? (
                booking.order.map(item => {
                    const menuItem = menuItems.find(mi => mi.id === item.id);
                    return (<div key={`${item.id}-${Date.now()}-${Math.random()}`} className="flex justify-between items-center text-sm"><span>{item.quantity}x {menuItem?.name || 'Unknown Item'}</span><span>${(menuItem ? menuItem.price * item.quantity : 0).toFixed(2)}</span></div>)
                })
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground"><UtensilsCrossed className="w-5 h-5 mr-2"/> No items ordered yet.</div>
              )}
            </ScrollArea>
            <div className="flex justify-between items-center font-bold text-lg pt-2"><span>Total:</span><span>${totalAmount.toFixed(2)}</span></div>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Add to Order</h4>
            <ScrollArea className="h-[350px] border rounded-md p-2">
              <div className="space-y-2">{menuItems.map(item => (<div key={item.id} className="flex justify-between items-center p-2 rounded-md hover:bg-muted"><div><p className="font-medium">{item.name}</p><p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p></div><Button size="icon" variant="ghost" onClick={() => onAddOrderItem(table.number, item)}><PlusCircle className="w-5 h-5" /></Button></div>))}</div>
            </ScrollArea>
          </div>
        </div>
    );
};

const AvailableView = ({ table, onShowReservationForm }) => {
    return (
        <div className="py-4">
            <DialogHeader>
                <DialogTitle>Table {table.number} is Available</DialogTitle>
                <DialogDescription>What would you like to do with this table?</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 mt-6">
                <Button variant="outline" onClick={onShowReservationForm}><UserPlus className="mr-2 h-4 w-4" /> Add Walk-in</Button>
            </div>
        </div>
    )
};

const TableActionsDialog = ({ table, onOpenChange, onAddOrderItem, onAddReservation, onAddWalkIn, onUpdateBookingStatus }) => {
  const { user: loggedInUser } = useAdmin();
  const { bookings, restaurants } = useRestaurant();
  const [showReservationForm, setShowReservationForm] = useState(false);
  
  if (!table) return null;

  const restaurantId = loggedInUser?.id;
  const restaurant = restaurants.find(r => r.id === restaurantId);
  const menuItems = restaurant?.menu || [];
  
  const liveBookingData = table.isOccupied ? bookings.find(b => b.id === table.bookingId) : null;
  const isOccupied = table.isOccupied && liveBookingData;

  const handleClose = (isOpen) => {
    if(!isOpen) {
        setShowReservationForm(false);
        onOpenChange(false);
    }
  };

  const handleAddReservation = (restaurantId, reservationData) => {
      onAddReservation(restaurantId, reservationData);
      handleClose(false);
  };
  
  const handleAddOrderItem = (tableNumber, menuItem) => {
    if (!loggedInUser?.id) return;
    onAddOrderItem(loggedInUser.id, tableNumber, menuItem);
  };

  return (
    <Dialog open={!!table} onOpenChange={handleClose}>
      <DialogContent className={cn("sm:max-w-md", isOccupied && "sm:max-w-[800px]")}>
        {showReservationForm ? (
            <ReservationSubForm tableNumber={table.number} restaurantId={restaurantId} onReserve={handleAddReservation} onCancel={() => setShowReservationForm(false)} />
        ) : (
            <>
                <DialogHeader>
                    <DialogTitle>Actions for Table {table.number}</DialogTitle>
                    <DialogDescription>
                        {isOccupied ? `Managing booking for ${liveBookingData.name}.` : "This table is currently available."}
                    </DialogDescription>
                </DialogHeader>

                {isOccupied ? (
                    <OccupiedView table={table} booking={liveBookingData} onAddOrderItem={handleAddOrderItem} menuItems={menuItems} />
                ) : (
                    <AvailableView table={table} onShowReservationForm={() => setShowReservationForm(true)} />
                )}

                <DialogFooter className="pt-4">
                    {isOccupied && (
                        <div className="flex w-full justify-between">
                            <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="destructive"><Ban className="mr-2 h-4 w-4" /> Cancel Booking</Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will cancel the booking for {liveBookingData.name}. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel />
                                    <AlertDialogAction onClick={() => { onUpdateBookingStatus(liveBookingData.id, 'cancelled'); handleClose(false); }}>Confirm</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <Button onClick={() => { onUpdateBookingStatus(liveBookingData.id, 'completed'); handleClose(false); }}><CheckCircle className="mr-2 h-4 w-4" /> Complete Booking</Button>
                        </div>
                    )}
                    {!isOccupied && !showReservationForm && <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>}
                </DialogFooter>
            </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TableActionsDialog;
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Users, Clock, Calendar, Hash, UtensilsCrossed } from "lucide-react";
import { useRestaurant } from "@/context/RestaurantContext";

const TableDetailsDialog = ({ table, onOpenChange, onAddOrderItem }) => {
  const { bookings, restaurants } = useRestaurant();
  if (!table) return null;

  const liveBookingData = bookings.find(b => b.id === table.bookingId);

  if (!liveBookingData) {
      return (
        <Dialog open={true} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Table {table.number}</DialogTitle>
                    <DialogDescription>This table is now available.</DialogDescription>
                </DialogHeader>
                 <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      );
  }

  const restaurant = restaurants.find(r => r.id === liveBookingData.restaurantId);
  const menuItems = restaurant?.menu || [];

  const { booking } = { ...table, booking: liveBookingData };
  const totalAmount = booking.order.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Dialog open={!!table} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Details for Table {table.number}</DialogTitle>
          <DialogDescription>
            Manage booking and order for this table.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Booking Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center"><Hash className="w-4 h-4 mr-2 text-muted-foreground" /> <strong>Booking ID:</strong> {booking.id}</div>
              <div className="flex items-center"><Users className="w-4 h-4 mr-2 text-muted-foreground" /> <strong>Guest:</strong> {booking.name} ({booking.guests} people)</div>
              <div className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-muted-foreground" /> <strong>Date:</strong> {booking.date}</div>
              <div className="flex items-center"><Clock className="w-4 h-4 mr-2 text-muted-foreground" /> <strong>Time:</strong> {booking.time}</div>
              {booking.specialRequests && <p><strong>Requests:</strong> {booking.specialRequests}</p>}
            </div>
            
            <h4 className="font-semibold text-lg pt-4">Current Order</h4>
            <ScrollArea className="h-[200px] border rounded-md p-2">
              {booking.order.length > 0 ? (
                <div className="space-y-2">
                  {booking.order.map(item => (
                    <div key={`${item.id}-${item.quantity}`} className="flex justify-between items-center text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <UtensilsCrossed className="w-5 h-5 mr-2"/> No items ordered yet.
                </div>
              )}
            </ScrollArea>
            <div className="flex justify-between items-center font-bold text-lg pt-2">
                <span>Total:</span>
                <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Add to Order</h4>
            <ScrollArea className="h-[350px] border rounded-md p-2">
              <div className="space-y-2">
                {menuItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-2 rounded-md hover:bg-muted">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => onAddOrderItem(table.number, item)}>
                      <PlusCircle className="w-5 h-5" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TableDetailsDialog;
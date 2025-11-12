import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar, Clock, Users, User, Phone, Home } from 'lucide-react';

const ReservationConfirmationDialog = ({ isOpen, onClose, onConfirm, reservationDetails }) => {
  if (!isOpen) return null;

  const DetailItem = ({ icon, label, value }) => (
    <div className="flex items-center text-sm">
      {React.cloneElement(icon, { className: "w-4 h-4 mr-3 text-muted-foreground" })}
      <span className="font-medium text-muted-foreground">{label}:</span>
      <span className="ml-2 text-foreground">{value}</span>
    </div>
  );

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold">Confirm Your Reservation</AlertDialogTitle>
          <AlertDialogDescription>
            Please review your booking details below. Does everything look correct?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-4 space-y-4 rounded-lg border bg-muted/50 p-4">
          <DetailItem icon={<Home />} label="Restaurant" value={reservationDetails.restaurantName} />
          <DetailItem icon={<Calendar />} label="Date" value={reservationDetails.date} />
          <DetailItem icon={<Clock />} label="Time" value={reservationDetails.time} />
          <DetailItem icon={<Users />} label="Guests" value={reservationDetails.guests} />
          <hr/>
          <DetailItem icon={<User />} label="Full Name" value={reservationDetails.name} />
          <DetailItem icon={<Phone />} label="Contact" value={reservationDetails.contact} />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Edit Details</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirm Booking</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ReservationConfirmationDialog;
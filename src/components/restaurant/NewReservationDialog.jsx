import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Clock, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { NumberInput } from "@/components/ui/number-input";

const availableTimes = [
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", 
    "20:00", "20:30", "21:00", "21:30", "22:00"
];

const NewReservationDialog = ({ isOpen, onOpenChange, restaurantId, onAddReservation }) => {
    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [guests, setGuests] = useState(2);
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState("");

    const handleSubmit = () => {
        if(name && contact && date && time) {
            onAddReservation(restaurantId, { name, contact, guests, date: format(date, "yyyy-MM-dd"), time });
            onOpenChange(false);
            setName("");
            setContact("");
            setGuests(2);
            setDate(new Date());
            setTime("");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Reservation</DialogTitle>
                    <DialogDescription>Fill in the details to create a new reservation.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
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
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit}>Create Reservation</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default NewReservationDialog;
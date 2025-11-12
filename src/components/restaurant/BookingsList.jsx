import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { PlusCircle, SlidersHorizontal, Calendar as CalendarIcon, ArrowUp, ArrowDown, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import TimeSelector from "./TimeSelector";

const BookingsList = ({ 
  bookings, 
  onStatusChange, 
  onAssignTable, 
  tables, 
  onAddNewReservation,
  selectedDate,
  setSelectedDate,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  sortOption,
  setSortOption
}) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-green-100 text-green-800",
      denied: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-gray-100 text-gray-800"
    };
    return colors[status] || colors.pending;
  };

  const availableTables = tables.filter(table => !table.isOccupied);

  const sortOptions = [
    { key: 'time', label: 'Time' },
    { key: 'name', label: 'Name' },
    { key: 'guests', label: 'Guests' },
  ];

  const currentSortLabel = sortOptions.find(opt => opt.key === sortOption.key)?.label || 'Sort';

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">Active Bookings</h2>
        <Button variant="outline" size="sm" onClick={onAddNewReservation}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New
        </Button>
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex flex-wrap gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={"outline"} size="sm" className={cn("justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
            </PopoverContent>
          </Popover>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                {currentSortLabel}
                {sortOption.order === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={sortOption.key} onValueChange={(key) => setSortOption({ ...sortOption, key })}>
                {sortOptions.map(opt => (
                  <DropdownMenuRadioItem key={opt.key} value={opt.key}>
                    {opt.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Order</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup value={sortOption.order} onValueChange={(order) => setSortOption({ ...sortOption, order })}>
                    <DropdownMenuRadioItem value="asc">
                      Ascending
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="desc">
                      Descending
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          <TimeSelector value={startTime} onChange={setStartTime} />
          <span className="text-muted-foreground">-</span>
          <TimeSelector value={endTime} onChange={setEndTime} />
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-4 pr-4">
          {bookings.length > 0 ? bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-lg border bg-card p-4 shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{booking.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {booking.time} - {booking.guests} guests
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Contact: {booking.contact}
                  </p>
                  {booking.specialRequests && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Note: {booking.specialRequests}
                    </p>
                  )}
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>

              <div className="space-y-2">
                 {booking.status === "confirmed" && !booking.tableNumber && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">Assign Table</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Available Tables</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {availableTables.length > 0 ? availableTables.map(table => (
                          <DropdownMenuItem key={table.id} onClick={() => onAssignTable(booking.id, table.number)}>
                             T{table.number} ({table.seats}p)
                          </DropdownMenuItem>
                        )) : (
                          <DropdownMenuItem disabled>No tables available</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                )}


                {booking.tableNumber && (
                  <div className="flex items-center text-sm font-medium text-green-600">
                    <p>Assigned to Table {booking.tableNumber}</p>
                    {booking.seatedAt && (
                      <div className="flex items-center ml-2 text-xs text-muted-foreground border-l pl-2">
                        <Clock className="h-3 w-3 mr-1" />
                        Seated at {format(parseISO(booking.seatedAt), 'HH:mm')}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {booking.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => onStatusChange(booking.id, "confirmed")}
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onStatusChange(booking.id, "denied")}
                      >
                        Deny
                      </Button>
                    </>
                  )}
                  {booking.status === "confirmed" && (
                    <Button
                      size="sm"
                      onClick={() => onStatusChange(booking.id, "completed")}
                    >
                      Mark Completed
                    </Button>
                  )}
                  {["pending", "confirmed"].includes(booking.status) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onStatusChange(booking.id, "cancelled")}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center text-muted-foreground py-8">
              No active bookings for this slot.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default BookingsList;
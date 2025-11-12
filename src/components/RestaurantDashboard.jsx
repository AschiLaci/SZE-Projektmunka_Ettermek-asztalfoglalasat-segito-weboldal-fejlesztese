import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import TableMap from "./restaurant/TableMap";
import BookingsList from "./restaurant/BookingsList";
import { UserCircle, BookOpen, DollarSign, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRestaurant } from "@/context/RestaurantContext";
import TableActionsDialog from "./restaurant/TableActionsDialog";
import ActivityLogs from "./restaurant/ActivityLogs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parse, startOfToday, setHours, parseISO, isToday, isEqual, startOfDay } from "date-fns";
import NewReservationDialog from "./restaurant/NewReservationDialog";

const StatCard = ({ title, value, icon, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const RestaurantDashboard = ({ onLogout, user }) => {
  const navigate = useNavigate();
  const { 
    restaurants,
    isInitialized,
    getLayoutForRestaurant,
    getBookingsForRestaurant,
    handleBookingStatus, 
    assignTable, 
    addOrderItem, 
    addReservation, 
    addWalkIn 
  } = useRestaurant();
  
  const [selectedTable, setSelectedTable] = useState(null);
  const [isNewReservationDialogOpen, setIsNewReservationDialogOpen] = useState(false);
  
  const restaurant = useMemo(() => restaurants.find(r => r.id === user.id), [restaurants, user.id]);
  const [layout, setLayout] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("22:00");
  const [sortOption, setSortOption] = useState({ key: 'time', order: 'asc' });

  useEffect(() => {
    if(isInitialized && user?.id){
        setLayout(getLayoutForRestaurant(user.id));
        setBookings(getBookingsForRestaurant(user.id));
    }
  }, [isInitialized, user, restaurants, getLayoutForRestaurant, getBookingsForRestaurant]);

  const filteredAndSortedBookings = useMemo(() => {
    if (!startTime || !endTime) return [];

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    const slotStart = setHours(selectedDate, startH);
    slotStart.setMinutes(startM);

    const slotEnd = setHours(selectedDate, endH);
    slotEnd.setMinutes(endM);

    const currentlySeatedBookings = bookings.filter(b => 
      b.status === 'confirmed' && 
      b.tableNumber && 
      b.seatedAt &&
      isToday(parseISO(b.seatedAt))
    );

    const bookingsInSlot = bookings.filter(b => {
      const bookingDateFromData = parseISO(b.date);
      if (!isEqual(startOfDay(bookingDateFromData), startOfDay(selectedDate))) {
        return false;
      }
      
      const bookingDateTime = parse(b.time, 'HH:mm', selectedDate);
      const isWithinRange = bookingDateTime >= slotStart && bookingDateTime < slotEnd;
      const isAtEndTime = endTime === "23:59" ? bookingDateTime.getTime() === slotEnd.getTime() : bookingDateTime.getTime() === slotEnd.getTime() && b.time === endTime;
      
      return (isWithinRange || isAtEndTime) && ['pending', 'confirmed'].includes(b.status);
    });

    const combinedBookings = [...currentlySeatedBookings, ...bookingsInSlot];
    const uniqueBookings = Array.from(new Set(combinedBookings.map(b => b.id))).map(id => {
      return combinedBookings.find(b => b.id === id);
    });

    return uniqueBookings.sort((a, b) => {
        if (sortOption.key === 'time') {
          const timeA = parse(a.time, 'HH:mm', new Date());
          const timeB = parse(b.time, 'HH:mm', new Date());
          return sortOption.order === 'asc' ? timeA - timeB : timeB - timeA;
        }
        if (sortOption.key === 'name') {
          return sortOption.order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        }
        if (sortOption.key === 'guests') {
          return sortOption.order === 'asc' ? a.guests - b.guests : b.guests - a.guests;
        }
        return 0;
      });
  }, [bookings, selectedDate, startTime, endTime, sortOption]);

  const stats = useMemo(() => {
    if (!restaurant) return { dailyBookings: 0, dailyRevenue: '$0.00', occupiedTables: '0 / 0', pendingReservations: 0 };
    
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const todaysBookings = bookings.filter(b => b.date === todayStr);
    const dailyRevenue = todaysBookings.reduce((acc, b) => acc + (b.totalSpent || 0), 0);
    const occupiedTablesCount = layout.filter(item => item.type === 'table' && item.isOccupied).length;
    const totalTables = layout.filter(item => item.type === 'table').length;
    const pendingReservations = bookings.filter(b => b.status === 'pending').length;

    return {
      dailyBookings: todaysBookings.length,
      dailyRevenue: `$${dailyRevenue.toFixed(2)}`,
      occupiedTables: `${occupiedTablesCount} / ${totalTables}`,
      pendingReservations,
    };
  }, [bookings, layout, restaurant]);

  const handleTableClick = (table) => {
    setSelectedTable(table);
  };

  const handleDialogClose = () => {
    setSelectedTable(null);
  };
  
  if (!restaurant || !isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Loading restaurant data...</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-screen-2xl"
        >
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{restaurant.name} Dashboard</h1>
              <p className="text-muted-foreground">Manage your bookings and table statuses in real-time.</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={() => navigate('/restaurant/profile')} variant="outline">
                <UserCircle className="mr-2 h-4 w-4" />
                Profile & Map Editor
              </Button>
              <Button onClick={onLogout} variant="outline">
                Logout
              </Button>
            </div>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Today's Bookings" value={stats.dailyBookings} icon={<BookOpen className="h-4 w-4 text-muted-foreground" />} description="Total reservations for today" />
            <StatCard title="Today's Revenue" value={stats.dailyRevenue} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} description="Total revenue from completed orders" />
            <StatCard title="Occupied Tables" value={stats.occupiedTables} icon={<Users className="h-4 w-4 text-muted-foreground" />} description="Currently occupied vs. total tables" />
            <StatCard title="Pending Reservations" value={stats.pendingReservations} icon={<BookOpen className="h-4 w-4 text-muted-foreground" />} description="Awaiting confirmation" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 xl:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl border bg-card p-4 shadow-sm lg:col-span-1 xl:col-span-1"
            >
              <BookingsList 
                bookings={filteredAndSortedBookings}
                onStatusChange={handleBookingStatus}
                onAssignTable={(bookingId, tableNumber) => assignTable(user.id, bookingId, tableNumber)}
                tables={layout.filter(t => t.type === 'table' && !t.isOccupied)}
                onAddNewReservation={() => setIsNewReservationDialogOpen(true)}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                startTime={startTime}
                setStartTime={setStartTime}
                endTime={endTime}
                setEndTime={setEndTime}
                sortOption={sortOption}
                setSortOption={setSortOption}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl border bg-card p-2 shadow-sm lg:col-span-2 xl:col-span-2 sm:p-4"
            >
              <TableMap 
                layout={layout}
                onTableClick={handleTableClick}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }}
              className="rounded-xl border bg-card p-4 shadow-sm lg:col-span-3 xl:col-span-1"
            >
              <ActivityLogs restaurantId={user.id} />
            </motion.div>
          </div>
        </motion.div>
      </div>
      <TableActionsDialog
        table={selectedTable}
        onOpenChange={handleDialogClose}
        onAddOrderItem={addOrderItem}
        onAddReservation={addReservation}
        onAddWalkIn={addWalkIn}
        onUpdateBookingStatus={handleBookingStatus}
      />
      <NewReservationDialog
        isOpen={isNewReservationDialogOpen}
        onOpenChange={setIsNewReservationDialogOpen}
        restaurantId={user.id}
        onAddReservation={addReservation}
      />
    </>
  );
};

export default RestaurantDashboard;
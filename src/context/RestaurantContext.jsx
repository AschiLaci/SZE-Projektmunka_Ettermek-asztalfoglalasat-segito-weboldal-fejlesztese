import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { format, addDays } from 'date-fns';
import { useLogs } from './LogContext';

const RestaurantContext = createContext();

export const useRestaurant = () => useContext(RestaurantContext);

const initializeFromJSON = async (key, jsonPath, processData = null) => {
  const existing = localStorage.getItem(key);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch (e) {
      console.error(`Error parsing ${key} from localStorage`, e);
      localStorage.removeItem(key);
    }
  }

  try {
    const response = await fetch(jsonPath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    let value = data[Object.keys(data)[0]] || data;

    if (processData) {
      value = processData(value);
    }

    localStorage.setItem(key, JSON.stringify(value));
    return value;
  } catch (error) {
    console.error(`Failed to load ${key} from JSON:`, error);
    return [];
  }
};

const processInitialBookings = (bookings) => {
  const today = new Date();
  return bookings.map((booking, index) => {
    const dayOffset = (index % 5) - 2; // -2, -1, 0, 1, 2
    const newDate = addDays(today, dayOffset);
    return {
      ...booking,
      date: format(newDate, 'yyyy-MM-dd'),
    };
  });
};


export const RestaurantProvider = ({ children }) => {
    const { toast } = useToast();
    const { addLog } = useLogs();

    const [restaurants, setRestaurants] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);

    const getLayoutForRestaurant = (restaurantId) => {
        const allRestaurants = JSON.parse(localStorage.getItem('restaurants') || '[]');
        const restaurant = allRestaurants.find(r => r.id === restaurantId);
        const allBookings = JSON.parse(localStorage.getItem('restaurantBookings') || '[]');
        const layoutData = restaurant?.layout || [];
        
        return layoutData.map(item => {
            if (item.type !== 'table') return item;
            
            const relevantBooking = allBookings.find(b => 
                b.restaurantId === restaurantId && 
                String(b.tableNumber) === String(item.number) && 
                b.status === 'confirmed'
            );
            
            return {
                ...item,
                isOccupied: !!relevantBooking,
                bookingId: relevantBooking ? relevantBooking.id : null,
            };
        });
    };
    
    const getBookingsForRestaurant = (restaurantId) => {
        const allBookings = JSON.parse(localStorage.getItem('restaurantBookings') || '[]');
        return allBookings.filter(b => b.restaurantId === restaurantId);
    };

    const syncData = () => {
      const restaurantsData = JSON.parse(localStorage.getItem('restaurants') || '[]');
      const bookingsData = JSON.parse(localStorage.getItem('restaurantBookings') || '[]');
      const usersData = JSON.parse(localStorage.getItem('adminUsers') || '[]');
      
      const activeUserIds = new Set(usersData.filter(u => u.status === 'active').map(u => u.id));

      const updatedRestaurants = restaurantsData.map(r => {
        const activeReviews = (r.reviews || []).filter(review => activeUserIds.has(review.userId));
        const totalRatings = activeReviews.length;
        const sumOfRatings = activeReviews.reduce((acc, curr) => acc + curr.rating, 0);
        const averageRating = totalRatings > 0 ? sumOfRatings / totalRatings : 0;
        
        const layout = r.layout || [];
        const tableCount = layout.filter(item => item.type === 'table').length;
        const bookingsDisabled = tableCount === 0 ? true : (r.bookingsDisabled || false);

        const [openingTime, closingTime] = (r.openingHours || " - ").split(' - ');

        return { 
          ...r, 
          rating: averageRating, 
          reviews: r.reviews || [], 
          menu: r.menu || [], 
          layout, 
          bookingsDisabled,
          firstBookingTime: r.firstBookingTime || openingTime.trim() || '',
          lastBookingTime: r.lastBookingTime || closingTime.trim() || '',
          maxBookingsPerSlot: r.maxBookingsPerSlot ?? tableCount,
          bookingThreshold: r.bookingThreshold || 30,
        };
      });
      
      setRestaurants(updatedRestaurants);
      setBookings(bookingsData);
    }

    useEffect(() => {
      const initialize = async () => {
        await Promise.all([
          initializeFromJSON('restaurants', '/data/restaurants.json'),
          initializeFromJSON('restaurantBookings', '/data/bookings.json', processInitialBookings),
          initializeFromJSON('adminUsers', '/data/admin-data.json')
        ]);
        
        syncData();
        setIsInitialized(true);
      };
      
      initialize();

      const handleStorageChange = (e) => {
        if (['restaurants', 'restaurantBookings', 'adminUsers'].includes(e.key)) {
          syncData();
        }
      };

      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };

    }, []);
    
    const updateAndPersist = (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
        syncData();
    }

    const updateLayout = (restaurantId, newLayout) => {
        const currentRestaurants = JSON.parse(localStorage.getItem('restaurants') || '[]');
        const updatedRestaurants = currentRestaurants.map(r => r.id === restaurantId ? { ...r, layout: newLayout } : r);
        updateAndPersist('restaurants', updatedRestaurants);
        addLog("Restaurant floor layout has been updated.", "layout", restaurantId);
    };

    const updateRestaurantDetails = (id, newDetails) => {
        const currentRestaurants = JSON.parse(localStorage.getItem('restaurants') || '[]');
        const newRestaurants = currentRestaurants.map(r => r.id === id ? { ...r, ...newDetails } : r);
        updateAndPersist('restaurants', newRestaurants);
        
        const currentUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]');
        const newUsers = currentUsers.map(u => u.id === id ? { ...u, name: newDetails.name, username: newDetails.username } : u);
        updateAndPersist('adminUsers', newUsers);

        addLog(`Restaurant details for '${newDetails.name}' have been updated.`, "info", id);
    };

    const updateBookingsAndLayout = (newBookings) => {
        localStorage.setItem('restaurantBookings', JSON.stringify(newBookings));
        syncData();
    };

    const handleBookingStatus = (bookingId, status) => {
        const currentBookings = JSON.parse(localStorage.getItem('restaurantBookings') || '[]');
        const currentRestaurants = JSON.parse(localStorage.getItem('restaurants') || '[]');
        
        const bookingToUpdate = currentBookings.find(b => b.id === bookingId);
        if (!bookingToUpdate) return;
        
        const newBookings = currentBookings.map(b => {
            if (b.id === bookingId) {
                let updatedBooking = { ...b, status };

                if (status === 'completed') {
                    const restaurant = currentRestaurants.find(r => r.id === b.restaurantId);
                    const menu = restaurant ? restaurant.menu : [];
                    const totalSpent = (b.order || []).reduce((acc, orderItem) => {
                        const menuItem = menu.find(item => item.id === orderItem.id);
                        return acc + (menuItem ? menuItem.price * orderItem.quantity : 0);
                    }, 0);
                    updatedBooking.totalSpent = totalSpent;
                }

                const statusMessage = {
                    confirmed: "Booking confirmed",
                    denied: "Booking denied",
                    completed: "Booking marked as completed",
                    cancelled: "Booking cancelled"
                };
                toast({
                    title: statusMessage[status] || 'Status Updated',
                    description: `Booking for ${b.name} has been ${status}`,
                    variant: status === "denied" || status === "cancelled" ? "destructive" : "default",
                });
                addLog(`Booking for '${b.name}' status changed to '${status}'.`, "booking", b.restaurantId);
                
                return updatedBooking;
            }
            return b;
        });
        updateBookingsAndLayout(newBookings);
    };

    const assignTable = (restaurantId, bookingId, tableNumber) => {
        const currentBookings = JSON.parse(localStorage.getItem('restaurantBookings') || '[]');
        const newBookings = currentBookings.map(b => {
            if (b.id === bookingId) {
                toast({
                    title: "Table Assigned",
                    description: `Table ${tableNumber} has been assigned to ${b.name}.`,
                });
                addLog(`Table ${tableNumber} assigned to booking for '${b.name}'.`, "table", restaurantId);
                return { ...b, tableNumber, status: 'confirmed', seatedAt: new Date().toISOString() };
            }
            return b;
        });
        updateBookingsAndLayout(newBookings);
    };

    const addOrderItem = (restaurantId, tableNumber, menuItem) => {
        if (!menuItem || !menuItem.id) {
            console.error("addOrderItem called with invalid menuItem", menuItem);
            toast({
                title: "Error",
                description: "Could not add item to order. Invalid item data.",
                variant: "destructive",
            });
            return;
        }

        const currentBookings = JSON.parse(localStorage.getItem('restaurantBookings') || '[]');
        const newBookings = currentBookings.map(b => {
            if (b.restaurantId === restaurantId && String(b.tableNumber) === String(tableNumber) && b.status === 'confirmed') {
                const existingItem = (b.order || []).find(item => item.id === menuItem.id);
                let newOrder;
                if (existingItem) {
                    newOrder = b.order.map(item => item.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item);
                } else {
                    newOrder = [...(b.order || []), { id: menuItem.id, quantity: 1 }];
                }
                return { ...b, order: newOrder };
            }
            return b;
        });
        updateAndPersist('restaurantBookings', newBookings);
        toast({
            title: "Order Updated",
            description: `${menuItem.name} added to Table ${tableNumber}'s order.`,
        });
        addLog(`'${menuItem.name}' added to order for Table ${tableNumber}.`, "order", restaurantId);
    };
    
    const addReservation = (restaurantId, reservation) => {
        if (!reservation) {
            console.error("addReservation called with undefined reservation object");
            toast({
                title: "Error",
                description: "Could not create reservation. Invalid data provided.",
                variant: "destructive",
            });
            return;
        }
        const currentBookings = JSON.parse(localStorage.getItem('restaurantBookings') || '[]');
        const newBooking = {
            id: uuidv4(),
            restaurantId,
            ...reservation,
            status: reservation.tableNumber ? 'confirmed' : 'pending',
            seatedAt: reservation.tableNumber ? new Date().toISOString() : null,
            order: [],
            totalSpent: 0
        };
        updateBookingsAndLayout([...currentBookings, newBooking]);
        toast({
            title: "Reservation Submitted",
            description: `Reservation for ${reservation.guests} guests on ${reservation.date} at ${reservation.time} has been created.`,
        });
        addLog(`New reservation created for '${reservation.name}' (${reservation.guests} guests).`, "booking", restaurantId);
    };
    
    const addWalkIn = (restaurantId, table, guests) => {
        const currentBookings = JSON.parse(localStorage.getItem('restaurantBookings') || '[]');
        const now = new Date();
        const newBooking = {
            id: uuidv4(),
            restaurantId,
            name: `Walk-in T${table.number}`,
            contact: 'N/A',
            date: format(now, "yyyy-MM-dd"),
            time: format(now, "HH:mm"),
            guests: guests,
            specialRequests: "Walk-in customer",
            tableNumber: table.number,
            status: 'confirmed',
            seatedAt: now.toISOString(),
            order: [],
            totalSpent: 0
        };
        updateBookingsAndLayout([...currentBookings, newBooking]);
        toast({
            title: "Walk-in Seated",
            description: `Table ${table.number} is now occupied by a walk-in party.`,
        });
        addLog(`Walk-in party seated at Table ${table.number}.`, "table", restaurantId);
    };

    const addRating = (restaurantId, rating, comment, userId) => {
        const currentRestaurants = JSON.parse(localStorage.getItem('restaurants') || '[]');
        const newRestaurants = currentRestaurants.map(r => {
            if (r.id === restaurantId) {
                const newReview = {
                    userId,
                    rating,
                    comment,
                    date: new Date().toISOString(),
                };
                const updatedReviews = [...(r.reviews || []), newReview];
                
                toast({
                    title: "Rating Submitted!",
                    description: `Thank you for rating ${r.name}.`,
                });
                addLog(`User rated ${r.name} with ${rating} stars.`, "rating", restaurantId);

                return { ...r, reviews: updatedReviews };
            }
            return r;
        });
        updateAndPersist('restaurants', newRestaurants);
    };

    const addMenuItem = (restaurantId, itemData) => {
        const currentRestaurants = JSON.parse(localStorage.getItem('restaurants') || '[]');
        const newRestaurants = currentRestaurants.map(r => {
            if (r.id === restaurantId) {
                const newItem = { ...itemData, id: uuidv4() };
                const updatedMenu = [...(r.menu || []), newItem];
                addLog(`New menu item '${itemData.name}' added to ${r.name}.`, "menu", restaurantId);
                return { ...r, menu: updatedMenu };
            }
            return r;
        });
        updateAndPersist('restaurants', newRestaurants);
    };

    const updateMenuItem = (restaurantId, itemId, itemData) => {
        const currentRestaurants = JSON.parse(localStorage.getItem('restaurants') || '[]');
        const newRestaurants = currentRestaurants.map(r => {
            if (r.id === restaurantId) {
                const updatedMenu = (r.menu || []).map(item => item.id === itemId ? { ...item, ...itemData } : item);
                addLog(`Menu item '${itemData.name}' updated for ${r.name}.`, "menu", restaurantId);
                return { ...r, menu: updatedMenu };
            }
            return r;
        });
        updateAndPersist('restaurants', newRestaurants);
    };

    const deleteMenuItem = (restaurantId, itemId) => {
        const currentRestaurants = JSON.parse(localStorage.getItem('restaurants') || '[]');
        const newRestaurants = currentRestaurants.map(r => {
            if (r.id === restaurantId) {
                const itemToDelete = (r.menu || []).find(item => item.id === itemId);
                const updatedMenu = (r.menu || []).filter(item => item.id !== itemId);
                if (itemToDelete) {
                    addLog(`Menu item '${itemToDelete.name}' deleted from ${r.name}.`, "menu", restaurantId);
                }
                return { ...r, menu: updatedMenu };
            }
            return r;
        });
        updateAndPersist('restaurants', newRestaurants);
    };

    const value = {
        restaurants,
        bookings,
        isInitialized,
        getLayoutForRestaurant,
        getBookingsForRestaurant,
        updateLayout,
        updateRestaurantDetails,
        handleBookingStatus,
        assignTable,
        addOrderItem,
        addReservation,
        addWalkIn,
        addRating,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem
    };

    return (
        <RestaurantContext.Provider value={value}>
            {isInitialized ? children : <div className="flex h-screen items-center justify-center"><p className="text-lg">Loading Restaurant Data...</p></div>}
        </RestaurantContext.Provider>
    );
};
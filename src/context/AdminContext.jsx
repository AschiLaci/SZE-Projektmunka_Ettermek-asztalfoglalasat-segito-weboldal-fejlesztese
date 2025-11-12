import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { format, subDays } from 'date-fns';

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

const initializeFromJSON = async (key, jsonPath) => {
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
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  } catch (error) {
    console.error(`Failed to load ${key} from JSON:`, error);
    return [];
  }
};

export const AdminProvider = ({ children }) => {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [logs, setLogs] = useState([]);
  const [statistics, setStatistics] = useState({
    totalRestaurants: 0,
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  const syncData = () => {
    const restaurantsData = JSON.parse(localStorage.getItem('restaurants') || '[]');
    const adminUsersData = JSON.parse(localStorage.getItem('adminUsers') || '[]');
    let bookingsData = JSON.parse(localStorage.getItem('restaurantBookings') || '[]');
    
    const restaurantUsers = restaurantsData.map(r => ({
      id: r.id,
      name: r.name,
      username: r.username,
      password: r.password,
      email: `${r.username}@example.com`,
      status: r.status,
      joinDate: r.joinDate || '2025-01-01',
      role: 'restaurant'
    }));
    
    const allUsersData = [...adminUsersData, ...restaurantUsers];
    
    const menuMap = new Map();
    restaurantsData.forEach(r => {
        (r.menu || []).forEach(item => {
            menuMap.set(item.id, item.price);
        });
    });

    bookingsData = bookingsData.map(booking => {
        if (!booking.totalSpent && booking.order && booking.order.length > 0) {
            const total = booking.order.reduce((acc, orderItem) => {
                const price = menuMap.get(orderItem.id) || 0;
                return acc + (price * orderItem.quantity);
            }, 0);
            return { ...booking, totalSpent: total };
        }
        return booking;
    });
    localStorage.setItem('restaurantBookings', JSON.stringify(bookingsData));
    
    const activeUsers = allUsersData.filter(u => u.status === 'active' && u.role === 'user');
    const activeUserIds = new Set(activeUsers.map(u => u.id));

    const totalRevenue = bookingsData.reduce((acc, booking) => acc + (booking.totalSpent || 0), 0);
    const today = format(new Date(), 'yyyy-MM-dd');
    
    const updatedRestaurants = restaurantsData.map(r => {
        const activeReviews = (r.reviews || []).filter(review => activeUserIds.has(review.userId));
        const totalRatings = activeReviews.length;
        const sumOfRatings = activeReviews.reduce((acc, curr) => acc + curr.rating, 0);
        const averageRating = totalRatings > 0 ? sumOfRatings / totalRatings : 0;
        
        const bookingsForRestaurant = bookingsData.filter(b => b.restaurantId === r.id);
        const totalBookings = bookingsForRestaurant.length;
        const revenue = bookingsForRestaurant.reduce((acc, b) => acc + (b.totalSpent || 0), 0);

        const dailyBookingsForRestaurant = bookingsForRestaurant.filter(b => b.date === today);
        const dailyBookings = dailyBookingsForRestaurant.length;
        const dailyRevenue = dailyBookingsForRestaurant.reduce((acc, b) => acc + (b.totalSpent || 0), 0);
        
        const layout = r.layout || [];
        const tableCount = layout.filter(item => item.type === 'table').length;
        const confirmedBookingsForRestaurant = bookingsForRestaurant.filter(b => b.status === 'confirmed');
        const currentlyOccupiedTables = layout.filter(item => item.type === 'table' && confirmedBookingsForRestaurant.some(b => String(b.tableNumber) === String(item.number))).length;
        
        const [openingTime, closingTime] = (r.openingHours || " - ").split(' - ');

        return { 
          ...r, 
          rating: averageRating, 
          reviews: r.reviews || [],
          totalBookings, 
          revenue, 
          dailyBookings,
          dailyRevenue,
          currentlyOccupiedTables,
          bookingsDisabled: tableCount === 0 ? true : (r.bookingsDisabled || false),
          firstBookingTime: r.firstBookingTime || openingTime.trim() || '',
          lastBookingTime: r.lastBookingTime || closingTime.trim() || '',
          maxBookingsPerSlot: r.maxBookingsPerSlot ?? tableCount,
          bookingThreshold: r.bookingThreshold || 30,
        };
    });
    
    const updatedUsers = allUsersData.map(u => {
      if (u.role === 'restaurant') {
        const restaurantData = updatedRestaurants.find(r => r.id === u.id);
        return {
          ...u,
          ...restaurantData,
          name: restaurantData?.name || u.name,
        }
      }

      const totalRatings = updatedRestaurants.reduce((acc, restaurant) => {
          return acc + (restaurant.reviews?.filter(review => review.userId === u.id).length || 0);
      }, 0);
      
      const userBookings = bookingsData.filter(b => b.userId === u.id);
      const totalBookings = userBookings.length;
      const totalSpent = userBookings.reduce((acc, b) => acc + (b.totalSpent || 0), 0);

      return {
          ...u,
          lastActive: u.lastActive || format(subDays(new Date(), Math.floor(Math.random() * 30)), 'yyyy-MM-dd'),
          totalRatings,
          totalBookings,
          totalSpent
      }
    });

    setRestaurants(updatedRestaurants);
    setUsers(updatedUsers);
    setBookings(bookingsData);
    
    setStatistics({
      totalRestaurants: restaurantsData.filter(r => r.status === 'active').length,
      totalUsers: activeUsers.length,
      totalBookings: bookingsData.length,
      totalRevenue,
    });
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await initializeFromJSON('restaurants', '/data/restaurants.json');
      await initializeFromJSON('adminUsers', '/data/admin-data.json');
      await initializeFromJSON('restaurantBookings', '/data/bookings.json');
      
      syncData();
      
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      
      setLoading(false);
    };

    initialize();

    const handleStorageChange = (e) => {
      if (['restaurants', 'adminUsers', 'restaurantBookings', 'adminBookings', 'user'].includes(e.key)) {
        syncData();
        if (e.key === 'user') {
          const savedUser = localStorage.getItem("user");
          setUser(savedUser ? JSON.parse(savedUser) : null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateAndPersist = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
    syncData();
  };
  
  const addRestaurantAndUser = (restaurantData) => {
    const currentRestaurants = JSON.parse(localStorage.getItem('restaurants') || '[]');
    
    const newId = `restaurant-${uuidv4()}`;
    const newRestaurant = {
      id: newId,
      ...restaurantData,
      password: restaurantData.password || 'password',
      rating: 0,
      reviews: [],
      menu: [],
      layout: [],
      status: 'pending',
      image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2670&auto=format&fit=crop'
    };
    
    updateAndPersist('restaurants', [...currentRestaurants, newRestaurant]);
  };

  const addUser = (userData) => {
    const currentUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]');
    const newUser = {
      id: `user-${uuidv4()}`,
      ...userData,
      joinDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString().split('T')[0],
      status: 'active',
    };
    updateAndPersist('adminUsers', [...currentUsers, newUser]);
  };
  
  const registerUser = (userData) => {
    return new Promise((resolve, reject) => {
      const allCurrentUsers = users;
      if (allCurrentUsers.some(u => u.username.toLowerCase() === userData.username.toLowerCase())) {
        reject(new Error("Username already exists."));
        return;
      }
      if (allCurrentUsers.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
        reject(new Error("Email already registered."));
        return;
      }

      const currentAdminUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]');
      const newUser = {
        id: `user-${uuidv4()}`,
        ...userData,
        role: 'user',
        joinDate: new Date().toISOString().split('T')[0],
        lastActive: new Date().toISOString().split('T')[0],
        status: 'active',
        password: 'password'
      };
      
      updateAndPersist('adminUsers', [...currentAdminUsers, newUser]);
      resolve(newUser);
    });
  };

  const updateUser = (userId, updatedData) => {
    const userToUpdate = users.find(u => u.id === userId);

    if (userToUpdate && userToUpdate.role === 'restaurant') {
      const currentRestaurants = JSON.parse(localStorage.getItem('restaurants') || '[]');
      const newRestaurants = currentRestaurants.map(r => r.id === userId ? { ...r, ...updatedData } : r);
      updateAndPersist('restaurants', newRestaurants);
    } else {
      const currentUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]');
      const newUsers = currentUsers.map(user => user.id === userId ? { ...user, ...updatedData } : user);
      updateAndPersist('adminUsers', newUsers);
    }
  };

  const updateUserStatus = (userId, status) => {
    const userToUpdate = users.find(u => u.id === userId);
    if (userToUpdate && userToUpdate.role === 'restaurant') {
      const currentRestaurants = JSON.parse(localStorage.getItem('restaurants') || '[]');
      const newRestaurants = currentRestaurants.map(r => r.id === userId ? { ...r, status } : r);
      updateAndPersist('restaurants', newRestaurants);
    } else {
      const currentUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]');
      const newUsers = currentUsers.map(user => user.id === userId ? { ...user, status } : user);
      updateAndPersist('adminUsers', newUsers);
    }
  };

  const deleteUser = (userId) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;

    if (userToDelete.role === 'restaurant') {
      const currentRestaurants = JSON.parse(localStorage.getItem('restaurants') || '[]');
      const newRestaurants = currentRestaurants.filter(r => r.id !== userId);
      updateAndPersist('restaurants', newRestaurants);
    } else {
      const currentUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]');
      const newUsers = currentUsers.filter(user => user.id !== userId);
      updateAndPersist('adminUsers', newUsers);
    }
    toast({
      title: "Account Deleted",
      description: `The account for ${userToDelete.name} has been permanently deleted.`,
      variant: "destructive",
    });
  };

  const addRestaurant = (restaurantData) => {
    addRestaurantAndUser(restaurantData);
  };

  const updateRestaurant = (restaurantId, updatedData) => {
    updateUser(restaurantId, updatedData);
  };

  const updateRestaurantStatus = (restaurantId, status) => {
    updateUserStatus(restaurantId, status);
  };

  const updateRestaurantLayout = (restaurantId, layout) => {
    const currentRestaurants = JSON.parse(localStorage.getItem('restaurants') || '[]');
    const newRestaurants = currentRestaurants.map(r => r.id === restaurantId ? { ...r, layout } : r);
    updateAndPersist('restaurants', newRestaurants);
  };

  const deleteUserRating = (userId, restaurantId, reviewDate) => {
    const currentRestaurants = JSON.parse(localStorage.getItem('restaurants') || '[]');
    const newRestaurants = currentRestaurants.map(r => {
      if (r.id === restaurantId) {
        const updatedReviews = r.reviews.filter(review => !(review.userId === userId && review.date === reviewDate));
        return { ...r, reviews: updatedReviews };
      }
      return r;
    });
    updateAndPersist('restaurants', newRestaurants);
  };

  const value = {
    user,
    setUser,
    users,
    setUsers,
    restaurants,
    bookings,
    logs,
    statistics,
    loading,
    addUser,
    registerUser,
    updateUser,
    updateUserStatus,
    deleteUser,
    addRestaurant,
    updateRestaurant,
    updateRestaurantStatus,
    updateRestaurantLayout,
    deleteUserRating
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
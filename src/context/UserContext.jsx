import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAdmin } from './AdminContext';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const { user: loggedInUser, users: allUsers, loading: adminLoading, updateUser: adminUpdateUser } = useAdmin();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (adminLoading) return;

    setLoading(true);

    if (loggedInUser && loggedInUser.role === 'user') {
      const userProfile = allUsers.find(u => u.id === loggedInUser.id);
      setProfile(userProfile);

      const allBookings = JSON.parse(localStorage.getItem('restaurantBookings') || '[]');
      setBookings(allBookings.filter(b => b.userId === loggedInUser.id));

      const allLogs = JSON.parse(localStorage.getItem('userLogs') || '[]');
      setLogs(allLogs.filter(l => l.userId === loggedInUser.id));
    } else {
      setProfile(null);
      setBookings([]);
      setLogs([]);
    }
    setLoading(false);
  }, [loggedInUser, allUsers, adminLoading]);

  const updateProfile = (newProfileData) => {
    if (!loggedInUser) return;
    
    adminUpdateUser(loggedInUser.id, newProfileData);

    setProfile(prev => ({...prev, ...newProfileData}));
  };

  const value = {
    profile,
    bookings,
    logs,
    loading: loading || adminLoading,
    updateProfile,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
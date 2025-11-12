import React from "react";
import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import Login from "./components/Login";
import Register from "./components/Register";
import AdminDashboard from "./components/AdminDashboard";
import RestaurantDashboard from "./components/RestaurantDashboard";
import UserDashboard from "./components/UserDashboard";
import UserProfile from "./components/user/UserProfile";
import RestaurantProfile from "./components/restaurant/RestaurantProfile";
import { RestaurantProvider } from "@/context/RestaurantContext";
import { LogProvider } from "@/context/LogContext";
import { AdminProvider, useAdmin } from "@/context/AdminContext";
import { UserProvider } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";

const AppContent = () => {
  const { user, setUser, users, updateUser } = useAdmin();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const savedUserJson = localStorage.getItem("user");
    if (savedUserJson) {
      try {
        const savedUser = JSON.parse(savedUserJson);
        if (users.length > 0) {
          const latestUserData = users.find(u => u.id === savedUser.id && u.role === savedUser.role);
          if (latestUserData) {
            setUser(latestUserData);
            localStorage.setItem("user", JSON.stringify(latestUserData));
          } else {
            handleLogout(true);
          }
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        handleLogout(true);
      }
    }
  }, [users, setUser]);

  const handleLogin = (userData) => {
    const lastActive = format(new Date(), 'yyyy-MM-dd');
    const updatedUserData = { ...userData, lastActive };
    
    updateUser(userData.id, { lastActive });

    setUser(updatedUserData);
    localStorage.setItem("user", JSON.stringify(updatedUserData));
    toast({
      title: `Welcome back, ${userData.name}!`,
      description: `Logged in as ${userData.role}.`,
    });
    
    let destination = '/';
    if (userData.role === 'admin') {
      destination = '/admin';
    } else if (userData.role === 'restaurant') {
      destination = '/restaurant';
    }
    
    navigate(destination);
  };

  const handleLogout = (silent = false) => {
    setUser(null);
    localStorage.removeItem("user");
    if (!silent) {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    }
    navigate("/login");
  };

  const handleClearLocalStorage = () => {
    localStorage.clear();
    toast({
      title: "Local Storage Cleared",
      description: "Application data has been reset. Reloading...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    if (!allowedRoles.includes(user.role)) {
      let destination = '/';
      if (user.role === 'admin') destination = '/admin';
      if (user.role === 'restaurant') destination = '/restaurant';
      return <Navigate to={destination} replace />;
    }
    return children;
  };

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <LogProvider>
          <RestaurantProvider>
              <UserProvider>
                <Routes>
                  <Route path="/login" element={<Login onLogin={handleLogin} />} />
                  <Route path="/register" element={<Register onRegister={handleLogin} />} />
                  
                  <Route path="/" element={<UserDashboard user={user} onLogout={handleLogout} />} />
                  <Route path="/profile" element={
                    <ProtectedRoute allowedRoles={['user']}>
                      <UserProfile onLogout={handleLogout} />
                    </ProtectedRoute>
                  }/>

                  <Route path="/admin/*" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard onLogout={handleLogout} user={user}/>
                    </ProtectedRoute>
                  }/>

                  <Route path="/restaurant" element={
                    <ProtectedRoute allowedRoles={['restaurant']}>
                      <RestaurantDashboard onLogout={handleLogout} user={user} />
                    </ProtectedRoute>
                  }/>
                  <Route path="/restaurant/profile" element={
                    <ProtectedRoute allowedRoles={['restaurant']}>
                      <RestaurantProfile onLogout={handleLogout} />
                    </ProtectedRoute>
                  }/>
                  
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </UserProvider>
          </RestaurantProvider>
        </LogProvider>
      </motion.div>
      <Button
        variant="destructive"
        className="fixed bottom-4 right-4 z-50 shadow-lg"
        onClick={handleClearLocalStorage}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Reset App Data
      </Button>
      <Toaster />
    </div>
  );
}

const App = () => {
  return (
    <AdminProvider>
      <AppContent />
    </AdminProvider>
  )
};

export default App;
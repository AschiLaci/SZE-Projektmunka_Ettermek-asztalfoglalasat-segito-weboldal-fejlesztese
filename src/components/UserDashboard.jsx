import React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import RestaurantSelection from "@/components/user/RestaurantSelection";
import RestaurantView from "@/components/user/RestaurantView";
import { useNavigate } from "react-router-dom";
import { UserCircle, LogIn, LogOut } from "lucide-react";

const UserDashboard = ({ user, onLogout }) => {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const navigate = useNavigate();

  const HeaderButtons = () => (
    <div className="mb-8 flex items-center justify-end gap-2">
      {user ? (
        <>
          <Button onClick={() => navigate('/profile')} variant="outline">
            <UserCircle className="mr-2 h-4 w-4" />
            Profile
          </Button>
          <Button onClick={onLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </>
      ) : (
        <Button onClick={() => navigate('/login')} variant="outline">
          <LogIn className="mr-2 h-4 w-4" />
          Login / Sign Up
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <AnimatePresence mode="wait">
        {!selectedRestaurant ? (
          <motion.div
            key="selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HeaderButtons />
            <RestaurantSelection onSelectRestaurant={setSelectedRestaurant} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <RestaurantView
              restaurant={selectedRestaurant}
              user={user}
              onBack={() => setSelectedRestaurant(null)}
              onLogout={onLogout}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserDashboard;
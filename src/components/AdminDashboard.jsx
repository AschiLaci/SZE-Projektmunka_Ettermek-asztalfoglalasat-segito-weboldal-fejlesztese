import React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RestaurantManagement from "./admin/RestaurantManagement";
import UserManagement from "./admin/UserManagement";
import Analytics from "./admin/Analytics";
import AdminManagement from "./admin/AdminManagement";
import { useAdmin } from "@/context/AdminContext";
import { Users, UtensilsCrossed, BookOpen, DollarSign, UserCog } from "lucide-react";

const AdminDashboard = ({ onLogout, user }) => {
  const [activeTab, setActiveTab] = useState("restaurants");
  const { statistics, loading } = useAdmin();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Loading Admin Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-7xl"
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name || 'Admin'}!</p>
          </div>
          <Button onClick={onLogout} variant="outline">
            Logout
          </Button>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-lg border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Total Restaurants</h3>
              <UtensilsCrossed className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mt-2 text-3xl font-bold">{statistics.totalRestaurants}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-lg border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Registered Users</h3>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mt-2 text-3xl font-bold">{statistics.totalUsers}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-lg border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Total Bookings</h3>
              <BookOpen className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mt-2 text-3xl font-bold">{statistics.totalBookings}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-lg border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mt-2 text-3xl font-bold">${statistics.totalRevenue.toLocaleString()}</p>
          </motion.div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="restaurants">
                <UtensilsCrossed className="mr-2 h-4 w-4" />Restaurants
            </TabsTrigger>
            <TabsTrigger value="users">
                <Users className="mr-2 h-4 w-4" />Users
            </TabsTrigger>
            <TabsTrigger value="admins">
                <UserCog className="mr-2 h-4 w-4" />Admins
            </TabsTrigger>
            <TabsTrigger value="analytics">
                <DollarSign className="mr-2 h-4 w-4" />Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="restaurants">
            <RestaurantManagement />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="admins">
            <AdminManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
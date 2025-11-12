import React from "react";
import { motion } from "framer-motion";
import { useAdmin } from "@/context/AdminContext";

const Analytics = () => {
  const { restaurants, users, bookings } = useAdmin();

  const revenueByMonth = bookings.reduce((acc, booking) => {
    const month = new Date(booking.date).toLocaleString('default', { month: 'short' });
    acc[month] = (acc[month] || 0) + booking.totalSpent;
    return acc;
  }, {});

  const revenueData = Object.entries(revenueByMonth).map(([month, amount]) => ({ month, amount }));
  const maxAmount = Math.max(...revenueData.map(d => d.amount), 0);

  const popularRestaurants = [...restaurants]
    .sort((a, b) => b.totalBookings - a.totalBookings)
    .slice(0, 5);

  const newUsersThisMonth = users.filter(user => {
    const joinDate = new Date(user.joinDate);
    const today = new Date();
    return joinDate.getMonth() === today.getMonth() && joinDate.getFullYear() === today.getFullYear();
  }).length;

  return (
    <div className="space-y-8">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-semibold">Revenue Overview</h3>
        {revenueData.length > 0 ? (
          <div className="h-64 w-full">
            <div className="flex h-full items-end justify-around gap-2">
              {revenueData.map((data, index) => (
                <div key={data.month} className="flex flex-1 flex-col items-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.amount / maxAmount) * 100}%` }}
                    transition={{ delay: index * 0.1 }}
                    className="w-12 rounded-t-md bg-primary/80 transition-all hover:bg-primary"
                  />
                  <p className="mt-2 text-sm">{data.month}</p>
                  <p className="text-xs text-muted-foreground">${data.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">No revenue data available.</p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-xl font-semibold">Popular Restaurants</h3>
          <div className="space-y-4">
            {popularRestaurants.map(r => (
              <div key={r.id} className="flex items-center justify-between">
                <p>{r.name}</p>
                <p className="font-medium">{r.totalBookings} bookings</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-xl font-semibold">User Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p>New Users (This Month)</p>
              <p className="font-medium">{newUsersThisMonth}</p>
            </div>
            <div className="flex items-center justify-between">
              <p>Active Users</p>
              <p className="font-medium">{users.filter(u => u.status === 'active').length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
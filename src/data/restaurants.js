import React from "react";

export const RESTAURANTS = [
  {
    id: 1,
    name: "The Gilded Spoon",
    cuisine: "Modern European",
    description: "Exquisite dishes crafted with locally-sourced ingredients in a chic, contemporary setting.",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2574&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Kyoto Blossom",
    cuisine: "Japanese & Sushi",
    description: "Authentic Japanese cuisine and the freshest sushi, served in a serene, traditional atmosphere.",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=2670&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Nonna's Kitchen",
    cuisine: "Classic Italian",
    description: "Heart-warming, traditional Italian recipes passed down through generations. Just like Nonna used to make.",
    image: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=80&w=2570&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "The Sizzling Skillet",
    cuisine: "American Steakhouse",
    description: "The best cuts of prime beef, grilled to perfection. A true paradise for meat lovers.",
    image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=2670&auto=format&fit=crop",
  },
];

export const USER_RESERVATIONS = [
    {
      id: 1,
      date: "2025-07-25",
      time: "19:00",
      guests: 2,
      status: "confirmed",
      tableNumber: 4,
      restaurantName: "The Gilded Spoon",
    },
];
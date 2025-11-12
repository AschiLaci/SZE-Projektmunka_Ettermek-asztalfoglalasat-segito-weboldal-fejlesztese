import React from "react";

export const RESTAURANTS = [
  {
    id: 1,
    name: "The Gilded Spoon",
    cuisine: "Modern European",
    description: "Exquisite dishes crafted with locally-sourced ingredients in a chic, contemporary setting.",
    image: "/images/restaurant1.jpeg",
  },
  {
    id: 2,
    name: "Kyoto Blossom",
    cuisine: "Japanese & Sushi",
    description: "Authentic Japanese cuisine and the freshest sushi, served in a serene, traditional atmosphere.",
    image: "/images/restaurant2.jpeg",
  },
  {
    id: 3,
    name: "Nonna's Kitchen",
    cuisine: "Classic Italian",
    description: "Heart-warming, traditional Italian recipes passed down through generations. Just like Nonna used to make.",
    image: "/images/restaurant3.jpeg",
  },
  {
    id: 4,
    name: "The Sizzling Skillet",
    cuisine: "American Steakhouse",
    description: "The best cuts of prime beef, grilled to perfection. A true paradise for meat lovers.",
    image: "/images/restaurant4.jpeg",
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
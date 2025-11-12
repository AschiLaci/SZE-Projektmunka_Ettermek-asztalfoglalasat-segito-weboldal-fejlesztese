import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const RestaurantCard = ({ restaurant, onSelect }) => (
  <motion.div
    layoutId={`restaurant-card-${restaurant.id}`}
    whileHover={{ scale: 1.03, y: -5 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    onClick={() => onSelect(restaurant)}
    className="group relative cursor-pointer overflow-hidden rounded-lg border bg-card shadow-lg flex flex-col"
  >
    <div className="h-48 w-full overflow-hidden">
      <img 
        alt={restaurant.name}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        src={restaurant.image} />
    </div>
    <div className="p-4 flex flex-col flex-grow">
      <h3 className="text-xl font-bold text-foreground">{restaurant.name}</h3>
      <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
      <p className="text-sm text-muted-foreground mt-2 flex-grow">{restaurant.description}</p>
      <div className="mt-2 flex items-center">
        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
        <span className="ml-1 text-sm font-medium">{restaurant.rating.toFixed(1)}</span>
      </div>
    </div>
    <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
  </motion.div>
);

export default RestaurantCard;
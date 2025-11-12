import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { UtensilsCrossed, ChevronDown } from "lucide-react";
import RestaurantCard from "@/components/user/RestaurantCard";
import { useRestaurant } from "@/context/RestaurantContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const RestaurantSelection = ({ onSelectRestaurant }) => {
  const { restaurants } = useRestaurant();
  const [sortOption, setSortOption] = useState("rating_desc");

  const activeRestaurants = useMemo(() => {
    const sorted = [...restaurants.filter(r => r.status === 'active')];

    switch (sortOption) {
      case "rating_desc":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "name_asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name_desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }
    return sorted;
  }, [restaurants, sortOption]);

  const sortOptions = {
    rating_desc: "By Rating (High to Low)",
    name_asc: "By Name (A-Z)",
    name_desc: "By Name (Z-A)",
  };

  return (
    <div className="mx-auto max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <UtensilsCrossed className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground">
          Choose a Restaurant
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Select where you'd like to dine tonight.
        </p>
      </motion.div>

      <div className="mt-8 mb-6 flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Sort: {sortOptions[sortOption]}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSortOption("rating_desc")}>
              By Rating (High to Low)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOption("name_asc")}>
              By Name (A-Z)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOption("name_desc")}>
              By Name (Z-A)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {activeRestaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            onSelect={onSelectRestaurant}
          />
        ))}
      </div>
    </div>
  );
};

export default RestaurantSelection;
import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogIn, LogOut, UserCircle, Star } from "lucide-react";
import ReservationForm from "@/components/user/ReservationForm";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import RatingDialog from "./RatingDialog";
import { useRestaurant } from "@/context/RestaurantContext";
import { useAdmin } from "@/context/AdminContext";

const RestaurantView = ({ restaurant, user, onBack, onLogout }) => {
  const navigate = useNavigate();
  const { bookings: userBookings } = useUser();
  const { users } = useAdmin();
  const { addRating } = useRestaurant();
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);

  const canRate = useMemo(() => {
    if (!user || !userBookings) return false;
    return userBookings.some(
      (booking) =>
        booking.restaurantId === restaurant.id && booking.status === "completed"
    );
  }, [user, userBookings, restaurant.id]);

  const handleRatingSubmit = (rating, comment) => {
    addRating(restaurant.id, rating, comment, user.id);
    setIsRatingDialogOpen(false);
  };
  
  const getUserById = (userId) => {
    return users.find((u) => u.id === userId);
  };

  const visibleReviews = useMemo(() => {
    if (!restaurant.reviews) return [];
    return restaurant.reviews.filter(review => {
      const reviewUser = getUserById(review.userId);
      return reviewUser && reviewUser.status === 'active';
    });
  }, [restaurant.reviews, users]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mx-auto max-w-7xl"
    >
      <div className="relative h-64 w-full overflow-hidden rounded-lg mb-8">
        <img
          src={restaurant.image}
          alt={`${restaurant.name} banner`}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <Button onClick={onBack} variant="ghost" className="mb-2 text-white hover:bg-white/20">
              <ArrowLeft className="mr-2 h-4 w-4" /> Change Restaurant
          </Button>
          <h1 className="text-4xl font-bold text-white">
              {restaurant.name}
          </h1>
          <p className="text-lg text-gray-200">{restaurant.description}</p>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          {user ? (
            <>
              <Button onClick={() => navigate('/profile')} variant="outline" className="text-white border-white hover:bg-white/20">
                <UserCircle className="mr-2 h-4 w-4" />
                Profile
              </Button>
              <Button onClick={onLogout} variant="outline" className="text-white border-white hover:bg-white/20">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Button onClick={() => navigate('/login')} variant="outline" className="text-white border-white hover:bg-white/20">
              <LogIn className="mr-2 h-4 w-4" />
              Login / Sign Up
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6 md:col-span-2"
        >
          <ReservationForm restaurant={restaurant} user={user} />
        </motion.div>
        <div className="md:col-span-1">
            <div className="p-6 rounded-lg border bg-card">
                <h3 className="text-lg font-semibold mb-4">Restaurant Details</h3>
                <div className="flex items-center mb-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-2" />
                    <span className="font-bold text-lg">{restaurant.rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground ml-1">({visibleReviews.length} reviews)</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{restaurant.cuisine}</p>
                {canRate && (
                    <Button onClick={() => setIsRatingDialogOpen(true)} className="w-full">
                        <Star className="mr-2 h-4 w-4" /> Rate this Restaurant
                    </Button>
                )}
                <div className="mt-4 space-y-4">
                    <h4 className="font-semibold">Recent Reviews</h4>
                    {visibleReviews.length > 0 ? (
                        visibleReviews.slice(0, 3).map((review, index) => {
                            const reviewUser = getUserById(review.userId);
                            return (
                                <div key={index} className="border-t pt-2">
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                        ))}
                                        <span className="text-sm font-semibold ml-2">{reviewUser ? reviewUser.name : 'Anonymous'}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1 italic">"{review.comment}"</p>
                                </div>
                            )
                        })
                    ) : (
                        <p className="text-sm text-muted-foreground">No reviews yet.</p>
                    )}
                </div>
            </div>
        </div>
      </div>
      <RatingDialog
        isOpen={isRatingDialogOpen}
        onClose={() => setIsRatingDialogOpen(false)}
        onSubmit={handleRatingSubmit}
        restaurantName={restaurant.name}
      />
    </motion.div>
  );
};

export default RestaurantView;
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  restaurantIds: string[];
  dishIds: string[];
  toggleRestaurant: (restaurantId: string) => void;
  toggleDish: (dishId: string) => void;
  isRestaurantFavorite: (restaurantId: string) => boolean;
  isDishFavorite: (dishId: string) => boolean;
  isFavorite: (restaurantId: string) => boolean; // backward compat
  toggle: (restaurantId: string) => void; // backward compat
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      restaurantIds: [],
      dishIds: [],

      toggleRestaurant: (restaurantId) =>
        set((state) => {
          const exists = state.restaurantIds.includes(restaurantId);
          return {
            restaurantIds: exists
              ? state.restaurantIds.filter((id) => id !== restaurantId)
              : [...state.restaurantIds, restaurantId],
          };
        }),

      toggleDish: (dishId) =>
        set((state) => {
          const exists = state.dishIds.includes(dishId);
          return {
            dishIds: exists
              ? state.dishIds.filter((id) => id !== dishId)
              : [...state.dishIds, dishId],
          };
        }),

      isRestaurantFavorite: (restaurantId) =>
        get().restaurantIds.includes(restaurantId),

      isDishFavorite: (dishId) => get().dishIds.includes(dishId),

      isFavorite: (restaurantId) => get().restaurantIds.includes(restaurantId),
      toggle: (restaurantId) => get().toggleRestaurant(restaurantId),
    }),
    { name: 'food-delivery-favorites' }
  )
);

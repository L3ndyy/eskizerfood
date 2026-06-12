import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  dishId: string;
  dishName: string;
  price: number;
  quantity: number;
  image?: string;
  restaurantId: string;
  restaurantName: string;
}

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,

      addItem: (item) => {
        const { restaurantId, restaurantName } = item;
        set((state) => {
          const existing = state.items.find((i) => i.dishId === item.dishId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.dishId === item.dishId
                  ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
                  : i
              ),
              restaurantId: state.restaurantId ?? restaurantId,
            };
          }
          return {
            items: [
              ...state.items,
              { ...item, quantity: item.quantity ?? 1, restaurantName },
            ],
            restaurantId: state.restaurantId ?? restaurantId,
          };
        });
      },

      removeItem: (dishId) =>
        set((state) => {
          const items = state.items.filter((i) => i.dishId !== dishId);
          return {
            items,
            restaurantId: items.length > 0 ? state.restaurantId : null,
          };
        }),

      updateQuantity: (dishId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            const items = state.items.filter((i) => i.dishId !== dishId);
            return {
              items,
              restaurantId: items.length > 0 ? state.restaurantId : null,
            };
          }
          return {
            items: state.items.map((i) =>
              i.dishId === dishId ? { ...i, quantity } : i
            ),
          };
        }),

      clearCart: () => set({ items: [], restaurantId: null }),

      getTotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getItemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'food-delivery-cart' }
  )
);

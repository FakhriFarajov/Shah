import { createSlice } from '@reduxjs/toolkit';

export interface CartItemType {
  id: string;
  quantity: number;
  name: string;
  price: number;
  inStock: number;
  image?: string;
  size?: string;
  color?: string;
  daysLeft?: number;
  oldPrice?: number;
}

const initialState: CartItemType[] = [];

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      const existing = state.find(item =>
        item.id === product.id &&
        item.size === product.selectedSize &&
        item.color === product.selectedColor
      );

      if (existing) {
        if (existing.quantity < product.inStock) {
          existing.quantity += 1;
        }
      } else {
        state.push({
          id: product.id,
          quantity: 1,
          name: product.name,
          price: product.price,
          inStock: product.inStock,
          image: product.images?.[0],
          size: product.selectedSize,
          color: product.selectedColor,
          daysLeft: product.daysLeft,
          oldPrice: product.oldPrice
        });
      }
    },

    updateQuantity: (state, action) => {
      const { id, delta, productStock, size, color } = action.payload;
      return state.map(item =>
        item.id === id && item.size === size && item.color === color
          ? {
            ...item,
            quantity: Math.min(
              productStock,
              Math.max(1, Number(item.quantity || 1) + delta)
            )
          }
          : item
      );
    },

    removeFromCart: (state, action) =>
      state.filter(item => item.id !== action.payload),

    clearCart: () => []
  }
});

export const { addToCart, updateQuantity, removeFromCart, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;

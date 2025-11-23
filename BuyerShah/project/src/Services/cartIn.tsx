// utils/cartUtils.ts
export const isInCart = (cartItems, productId) =>
  cartItems.some(item => item.id === productId);

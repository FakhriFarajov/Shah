import { createSlice } from "@reduxjs/toolkit";
const productSlice = createSlice({
  name: "products",
  initialState: [],
  reducers: {
    setProducts: (state, action) => {
      return action.payload;
    },
    updateProductStock: (state, action) => {
      const { id, quantity } = action.payload;
      const product = state.find(product => product.id === id);
      if (product) {
        product.inStock = Math.max(0, product.inStock - quantity);
      }
    },
  }
});

export const { setProducts, updateProductStock } = productSlice.actions;
export default productSlice.reducer;
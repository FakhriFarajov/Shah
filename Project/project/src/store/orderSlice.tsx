import { createSlice } from "@reduxjs/toolkit";

const orderSlice = createSlice({
  name: "orders",
  initialState: [],
  reducers: {
    addOrder: (state, action) => {
      state.push(action.payload);
    },
    clearOrders: () => []
  }
});

export const { addOrder, clearOrders } = orderSlice.actions;
export default orderSlice.reducer;

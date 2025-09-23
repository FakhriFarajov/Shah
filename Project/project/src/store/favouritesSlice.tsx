import { createSlice } from "@reduxjs/toolkit";


type FavouriteItem = any; // You can replace 'any' with your product type

const favouritesSlice = createSlice({
  name: "favourites",
  initialState: [] as FavouriteItem[],
  reducers: {
    addFavourite: (state, action) => {
      if (!state.find((item) => item.id === action.payload.id)) {
        state.push(action.payload);
      }
    },
    removeFavourite: (state, action) => {
      return state.filter((item) => item.id !== action.payload.id);
    },
    clearFavourites: () => [],
    updateFavourites: (state, action) => {
      return Array.isArray(action.payload) ? action.payload : state;
    }
  }
});

export const { addFavourite, removeFavourite, clearFavourites } = favouritesSlice.actions;
export default favouritesSlice.reducer;

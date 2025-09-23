import { configureStore, combineReducers } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import orderReducer from "./orderSlice";
import favouritesReducer from "./favouritesSlice";
import productReducer from "./productSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "root",
  storage
};

const rootReducer = combineReducers({
  cart: cartReducer,
  orders: orderReducer,
  favourites: favouritesReducer,
  product: productReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer
});

export const persistor = persistStore(store);
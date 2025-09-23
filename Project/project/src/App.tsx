import './App.css';
import Main from './pages/mainPage';
import LoginForm from './pages/login';
import RegForm from './pages/register';
import ProfilePage from './pages/profile';
import Cart from './pages/cartPage';
import "./i18n";
import ProductPage from './pages/ProductPage';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store, persistor } from '@/store';
import { PersistGate } from 'redux-persist/integration/react';
import OrderPage from './pages/orderPage';
import CategoryPage from './pages/categoriesPage';
import { Toaster } from 'sonner';
import FavouritesPage from './pages/favouritesPage';




function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <Routes>
            <Route path='/main' element={<Main />} />
            <Route path='/login' element={<LoginForm />} />
            <Route path='/reg' element={<RegForm />} />
            <Route path='/cart' element={<Cart />} />
            <Route path='/favourites' element={<FavouritesPage />} />
            <Route path='/order' element={<OrderPage />} />
            <Route path='/profile' element={<ProfilePage profile={{
              user: {
                id: "1",
                name: "John",
                surname: "Doe",
                email: "john@example.com",
                phone: "+994123456789",
                countryCode: "AZ",
                createdAt: new Date().toISOString(),
              },
              address: {
                id: "1",
                street: "123 Main St",
                city: "Baku",
                postalCode: "1000",
                country: "Azerbaijan",
              },
              favorites: [],
              orders: [],
              reviews: [],
              cartItems: [],
              payments: [],
            }} />}
          />
            <Route path='/' element={<Main />} />
            <Route path='/category/:category' element={<CategoryPage />} />
            <Route path='/category/:category/:subcategory' element={<CategoryPage />} />
            <Route path='/product/:id' element={<ProductPage />} />
          </Routes>
        </BrowserRouter>
      </PersistGate>
      <Toaster />
    </Provider>
  );
}

export default App;

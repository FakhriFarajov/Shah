import './App.css';
import Main from './pages/mainPage';
import LoginForm from './pages/login';
import RegForm from './pages/register';
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
import AuthProvider from './features/auth/contexts/AuthProvider';
import ProfilePage from './pages/profile';
import NotFound from './pages/notFound';



function App() {


  // const { isLoading } = useContext(AuthContext);

  // if (isLoading) {
  //   return (
  //     <div
  //       style={{
  //         display: "flex",
  //         justifyContent: "center",
  //         alignItems: "center",
  //         height: "100vh",
  //         fontSize: "18px",
  //       }}
  //     >
  //       Loading
  //     </div>
  //   );
  // }

  
  return (
    <AuthProvider>
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
              <Route path='/profile' element={<ProfilePage />} />
              <Route path='/' element={<Main />} />
              <Route path='/category/:category' element={<CategoryPage />} />
              <Route path='/category/:category/:subcategory' element={<CategoryPage />} />
              <Route path='/product/:id' element={<ProductPage />} />
              <Route path='*' element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </PersistGate>
        <Toaster 
          position="top-right"
          richColors
          toastOptions={{
            duration: 3000,
          }}
        />
      </Provider>
    </AuthProvider>
  );
}

export default App;

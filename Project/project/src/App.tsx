import './App.css';
import Main from './pages/mainPage';
import LoginForm from './pages/login';
import RegForm from './pages/register';
import Cart from './pages/cartPage';
import "./i18n";
import ProductPage from './pages/ProductPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CategoryPage from './pages/categoriesPage';
import { Toaster } from 'sonner';
import FavouritesPage from './pages/favouritesPage';
import AuthProvider from './features/auth/contexts/AuthProvider';
import ProfilePage from './pages/profile';
import NotFound from './pages/notFound';
import Checkout from './pages/checkout';



function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/main' element={<Main />} />
          <Route path='/login' element={<LoginForm />} />
          <Route path='/reg' element={<RegForm />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/checkout' element={<Checkout />} />
          <Route path='/favourites' element={<FavouritesPage />} />
          <Route path='/profile' element={<ProfilePage />} />
          <Route path='/' element={<Main />} />
          <Route path='/category' element={<CategoryPage />} />
          <Route path='/product' element={<ProductPage />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          duration: 3000,
        }}
      />
    </AuthProvider>
  );
}

export default App;

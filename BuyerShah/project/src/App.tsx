import './App.css';
import Main from './pages/mainPage';
import LoginForm from './pages/login';
import RegForm from './pages/register';
import Cart from './pages/cartPage';
import ProductPage from './pages/ProductPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EmailConfirmationPage from './pages/EmailConfirmationPage';
import CategoryPage from './pages/categoriesPage';
import { Toaster } from 'sonner';
import FavouritesPage from './pages/favouritesPage';
import AuthProvider from './features/auth/contexts/AuthProvider';
import ProfilePage from './pages/profile';
import NotFound from './pages/notFound';
import Checkout from './pages/checkout';
import SearchPage from './pages/SearchPage';

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
          <Route path='/search' element={<SearchPage />} />
          <Route path='/email-confirmation' element={<EmailConfirmationPage />} />
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

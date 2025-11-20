import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './App.css'
import Login from './pages/login';
import Home from './pages/home';
import BuyersPage from './pages/Buyer/buyers';
import SellersPage from './pages/Seller/sellers';
import ProfileBuyer from './pages/Buyer/profileBuyer';
import ProfileSeller from './pages/Seller/profileSeller';
import ProductsPage from './pages/products';
import WarehousesPage from './pages/warehouses';
import CategoryManager from './pages/categoriesPage';
import OrdersPage from './pages/orders';
import AdminProfilesPage from './pages/admins';
import AuthProvider from './features/auth/contexts/AuthProvider';
import WarehousesOrdersPage from './pages/warehousesOrders';
import ProductsEditOrAddPage from './pages/productEditPage';
import ProductDetailsPage from './pages/productDetails';
import { Toaster } from 'sonner';
function App() {

  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/' element={<Home />} />
            <Route path='/home' element={<Home />} />
            <Route path='/warehouses' element={<WarehousesPage />} />
            <Route path='/warehouse-orders' element={<WarehousesOrdersPage />} />
            <Route path='/buyers' element={<BuyersPage />} />
            <Route path='/buyer-profile' element={<ProfileBuyer />} />
            <Route path='/sellers' element={<SellersPage />} />
            <Route path='/seller-profile' element={<ProfileSeller />} />
            <Route path='/orders-buyer' element={<OrdersPage />} />//by id
            <Route path='/orders-seller' element={<OrdersPage />} />//By id
            <Route path='/orders' element={<OrdersPage />} />//All of them with filter
            <Route path='/products' element={<ProductsPage />} />//by id
            <Route path='/productsEditOrAdd' element={<ProductsEditOrAddPage />} />
            <Route path='/product-details' element={<ProductDetailsPage />} />
            <Route path='/categories' element={<CategoryManager />} />
            <Route path='/admins' element={<AdminProfilesPage />} />
            <Route path='*' element={<Login />} />
          </Routes>
        </BrowserRouter>
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            duration: 4000,
          }}
        />
      </AuthProvider>

    </>
  )
}

export default App

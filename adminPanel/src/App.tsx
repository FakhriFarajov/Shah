import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './App.css'
import Login from './pages/login';
import Home from './pages/home';
import BuyersPage from './pages/Buyer/buyers';
import SellersPage from './pages/Seller/sellers';
import ProfileBuyer from './pages/Buyer/profileBuyer';
import ProfileSeller from './pages/Seller/profileSeller';
import ReviewsPage from './pages/reviews';
import ProductsPage from './pages/products';
import WarehousesPage from './pages/warehouses';
import CategoryManager from './pages/categoriesPage';



import OrdersPage from './pages/orders';
import AdminProfilesPage from './pages/AdminProfileAdd';
function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/' element={<Home />} />
          <Route path='/home' element={<Home />} />
          <Route path='/warehouses' element={<WarehousesPage />} />
          <Route path='/buyers' element={<BuyersPage />} />
          <Route path='/buyer-details' element={<ProfileBuyer />} /> // Will pass userId as prop later
          <Route path='/sellers' element={<SellersPage />} />
          <Route path='/seller-profile' element={<ProfileSeller />} />
          <Route path='/orders-buyer' element={<OrdersPage />} />//by id 
          <Route path='/orders-seller' element={<OrdersPage />} />//By id
          <Route path='/orders' element={<OrdersPage />} />//All of them with filter 
          <Route path='/reviews' element={<ReviewsPage />} />
          <Route path='/reviews-buyer' element={<ReviewsPage />} />//by id
          <Route path='/products' element={<ProductsPage />} />//by id
          <Route path='/categories' element={<CategoryManager />} />
          <Route path='/admin-profiles' element={<AdminProfilesPage />} />
          <Route path='*' element={<Login />} />

        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App

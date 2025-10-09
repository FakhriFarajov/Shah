import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './App.css'
import Login from './pages/login';
import Home from './pages/home';
import BuyersPage from './pages/Buyer/buyers';
import SellersPage from './pages/sellers';
import ProfileBuyer from './pages/Buyer/profileBuyer';
import ProfileSeller from './pages/profileSeller';
import OrdersPage from './pages/ordersPageUniversal';
import ReviewsBuyerPage from './pages/Buyer/reviewsBuyer';
// import OrderDetailsPage from './pages/orderDetails';
// import WarehousePage from './pages/warehouse';
// import WarehouseDetailPage from './pages/warehouseDetail';
function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/' element={<Home />} />
          <Route path='/home' element={<Home />} />
          <Route path='/buyers' element={<BuyersPage />} />
          <Route path='/buyer-details' element={<ProfileBuyer />} /> // Will pass userId as prop later
          <Route path='/sellers' element={<SellersPage />} />
          <Route path='/seller-details' element={<ProfileSeller />} /> // Will pass userId as prop later
          <Route path='/orders' element={<OrdersPage />} />
          <Route path='/reviews-buyer' element={<ReviewsBuyerPage />} />
          {/* <Route path='/order-details/' element={<OrderDetailsPage />} /> */}
          {/* <Route path='/warehouse' element={<WarehousePage />} /> */}
          {/* <Route path='/warehouse-datails/' element={<WarehouseDetailPage />} /> */}


        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App

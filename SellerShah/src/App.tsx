import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Login from './pages/login'
import Reg from './pages/register'
import LandingPage from './pages/landingPage'
import Main from './pages/main'
import SellerProfile from './pages/profile'
import ProductsPage from './pages/products'
import OrdersPage from './pages/orders'
import ReportPage from './pages/report'
import ReviewsPage from './pages/reviews'
import { Toaster } from 'sonner';
import ProductDetailsPage from './pages/productsPage'
import AuthProvider from './features/auth/contexts/AuthProvider'
import ProductsEditOrAddPage from './pages/productEditPage'


function App() {

  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/main' element={<LandingPage />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Reg />} />
            <Route path='/' element={<LandingPage />} />
            <Route path='/home' element={<Main />} />
            <Route path='/profile' element={<SellerProfile />} />
            <Route path='/products' element={<ProductsPage />} />
            <Route path='/productsEditOrAdd' element={<ProductsEditOrAddPage />} />
            <Route path='/product-details' element={<ProductDetailsPage />} />
            <Route path='/orders' element={<OrdersPage />} />
            <Route path='/report' element={<ReportPage />} />
            <Route path='/reviews' element={<ReviewsPage />} />
          </Routes>

        </BrowserRouter>
        <Toaster
          position="top-right"
          richColors
        />
      </AuthProvider>
    </div>
  )
}

export default App

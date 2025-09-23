import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './App.css'
import Login from './pages/login';
import Main from './pages/main';
import BuyersPage from './pages/buyers';
import SellersPage from './pages/sellers';
import BuyerDetailsPage from './pages/buyer-details';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/' element={<Main />} />
          <Route path='/main' element={<Main />} />
          <Route path='/buyers' element={<BuyersPage />} />
          <Route path='/sellers' element={<SellersPage />} />
          <Route path='/buyer-details/:id' element={<BuyerDetailsPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App

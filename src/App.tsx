import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Chatbot } from './components/Chatbot';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { CheckoutModal } from './components/CheckoutModal';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OrderProvider>
          <CartProvider>
            <div className="min-h-screen bg-[#040A11] font-sans selection:bg-[#68E371]/30 selection:text-white">
            <Navbar />
            
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                <Route path="/order-history" element={<OrderHistoryPage />} />
              </Routes>
            </main>
            
            <Footer />
            <Chatbot />
            <CartDrawer />
            <AuthModal />
            <CheckoutModal />
          </div>
        </CartProvider>
        </OrderProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

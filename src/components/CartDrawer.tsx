import { useCart } from '../context/CartContext';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, totalPrice, vehiclesAndUpgradesPrice, setIsCheckoutModalOpen } = useCart();
  const { currentUser, setIsAuthModalOpen } = useAuth();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-[#040A11]/70 backdrop-blur-md"
            onClick={() => setIsCartOpen(false)}
          />

          {/* Slide-over Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} // smooth ease-out
              className="w-screen max-w-md bg-[#0B151F] border-l border-[#212A33] shadow-2xl flex flex-col justify-between"
            >
              
              {/* Header */}
              <div className="p-6 border-b border-[#212A33] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#68E371]/10 border border-[#68E371]/20 flex items-center justify-center text-[#68E371]">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-[#F6F9FC]">Your Volt Cart</h2>
                    <p className="text-xs text-[#8F9AA4]">
                      {cartItems.length === 0 ? 'Empty reservation' : `${cartItems.length} vehicle${cartItems.length > 1 ? 's' : ''} selected`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-[#8F9AA4] hover:text-[#F6F9FC] p-2 rounded-lg hover:bg-[#14202D] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-[#14202D] border border-[#212A33] flex items-center justify-center text-[#5A6E85] mb-4">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h3 className="font-display text-base font-bold text-[#F6F9FC] mb-1">Your cart is empty</h3>
                    <p className="text-sm text-[#8F9AA4] max-w-xs mb-6">
                      Browse our inventory of electric vehicles and reserve your dream drive today.
                    </p>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate('/shop');
                      }}
                      className="bg-[#14202D] hover:bg-[#68E371] text-[#F6F9FC] hover:text-[#050C13] text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200"
                    >
                      Explore Inventory
                    </button>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.vin}
                      className="bg-[#14202D] border border-[#212A33] rounded-2xl p-4 flex gap-4 items-start relative group"
                    >
                      {/* Thumbnail */}
                      <div className="w-24 h-16 rounded-xl bg-[#0B151F] overflow-hidden flex-shrink-0 border border-[#212A33]">
                        <img src={item.image} alt={item.model} className="w-full h-full object-cover" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-display text-sm font-bold text-[#F6F9FC] truncate">
                            {item.brand} {item.model}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.cartItemId!)}
                            className="text-[#5A6E85] hover:text-red-400 p-1 transition-colors -mt-1 -mr-1"
                            title="Remove vehicle"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-[11px] text-[#8F9AA4] mt-0.5 truncate">
                          {item.description} &middot; {item.horsePower} HP
                        </p>
                        <p className="text-[10px] text-[#5A6E85] mt-0.5 font-mono">
                          VIN: {item.vin}
                        </p>

                        <div className="mt-2 text-xs text-[#F6F9FC] font-semibold flex justify-between items-center">
                          <span className="text-[#8F9AA4]">Vehicle Base Price</span>
                          <span>${item.basePrice.toLocaleString()}</span>
                        </div>

                        {item.selectedParts && item.selectedParts.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-[#212A33]">
                            <span className="text-[10px] uppercase text-[#8F9AA4] font-bold tracking-wider block mb-1">Customizations</span>
                            <div className="space-y-1">
                              {item.selectedParts.map(part => (
                                <div key={part.id} className="flex justify-between text-xs">
                                  <span className="text-[#F6F9FC] truncate pr-2 flex-1">{part.name}</span>
                                  <span className="text-[#68E371] whitespace-nowrap">+${part.price.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-3 flex items-center justify-end">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 bg-[#0B151F] border border-[#212A33] rounded-lg px-2 py-1 text-xs">
                            <button
                              onClick={() => updateQuantity(item.cartItemId!, -1)}
                              className="text-[#8F9AA4] hover:text-[#F6F9FC] transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-semibold text-[#F6F9FC] px-1">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.cartItemId!, 1)}
                              className="text-[#8F9AA4] hover:text-[#F6F9FC] transition-colors opacity-50 cursor-not-allowed"
                              disabled
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer & Checkout */}
              {cartItems.length > 0 && (
                <div className="p-6 border-t border-[#212A33] bg-[#0A121A]/80 backdrop-blur-md">
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between text-[#8F9AA4]">
                      <span>Vehicles & Upgrades</span>
                      <span className="text-[#F6F9FC]">${vehiclesAndUpgradesPrice.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-[#212A33] flex justify-between font-bold text-base text-[#F6F9FC]">
                      <span>Estimated Total</span>
                      <span>${totalPrice.toLocaleString()}</span>
                    </div>
                  </div>


                  <button
                    onClick={() => {
                      if (!currentUser) {
                        setIsCartOpen(false);
                        setIsAuthModalOpen(true);
                        return;
                      }
                      setIsCartOpen(false);
                      setIsCheckoutModalOpen(true);
                    }}
                    className="w-full bg-[#68E371] hover:bg-[#52c95b] text-[#050C13] font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-[0_0_20px_rgba(104,227,113,0.2)]"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  </div>
              )}

            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

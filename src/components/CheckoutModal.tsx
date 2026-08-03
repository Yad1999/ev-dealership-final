import { useState, useEffect } from 'react';
import { X, MapPin, Phone, Building2, Map, Globe, Hash, Check, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export function CheckoutModal() {
  const { setIsCartOpen, isCheckoutModalOpen, setIsCheckoutModalOpen, shippingAddress, setShippingAddress } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const onClose = () => setIsCheckoutModalOpen(false);
  
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [country, setCountry] = useState('');
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState('');

  // Pre-fill input fields with user's account address or current shipping address on open
  useEffect(() => {
    if (isCheckoutModalOpen) {
      const activeAddress = shippingAddress || currentUser?.address;
      if (activeAddress) {
        setStreet(activeAddress.street || '');
        setCity(activeAddress.city || '');
        setProvince(activeAddress.province || '');
        setCountry(activeAddress.country || '');
        setZip(activeAddress.zip || '');
        setPhone(activeAddress.phone || '');
      } else {
        setStreet('');
        setCity('');
        setProvince('');
        setCountry('');
        setZip('');
        setPhone('');
      }
    }
  }, [isCheckoutModalOpen, currentUser, shippingAddress]);

  const handleUseAccountAddress = () => {
    if (currentUser?.address) {
      setStreet(currentUser.address.street || '');
      setCity(currentUser.address.city || '');
      setProvince(currentUser.address.province || '');
      setCountry(currentUser.address.country || '');
      setZip(currentUser.address.zip || '');
      setPhone(currentUser.address.phone || '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShippingAddress({ street, city, province, country, zip, phone });
    setIsCartOpen(false);
    onClose();
    navigate('/checkout');
  };

  const hasAccountAddress = Boolean(
    currentUser?.address?.street || currentUser?.address?.city
  );

  return (
    <AnimatePresence>
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          {/* Blurred overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-[#040A11]/70 backdrop-blur-md"
            onClick={onClose}
          />
          
          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg max-h-[90vh] bg-[#0B151F] border border-[#212A33] rounded-3xl shadow-2xl overflow-y-auto flex flex-col"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-[#8F9AA4] hover:text-[#F6F9FC] transition-colors p-1 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="p-8">
              <div className="text-center mb-6">
                <h2 className="font-display text-2xl font-bold text-[#F6F9FC] mb-2">
                  Shipping Details
                </h2>
                <p className="text-[#8F9AA4] text-sm">
                  Review or update your delivery address for this order.
                </p>
              </div>

              {hasAccountAddress && (
                <div className="mb-5 p-3.5 bg-[#14202D] border border-[#212A33] rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[#68E371]/10 flex items-center justify-center text-[#68E371] shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#F6F9FC] truncate">Account Address Loaded</p>
                      <p className="text-[11px] text-[#8F9AA4] truncate">
                        {currentUser?.address?.street}, {currentUser?.address?.city}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleUseAccountAddress}
                    className="flex items-center gap-1 text-xs font-medium text-[#68E371] hover:text-[#52c95b] transition-colors shrink-0 px-2.5 py-1 rounded-lg bg-[#0B151F] border border-[#212A33]"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#8F9AA4] mb-1.5">Street Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6E85]" />
                    <input 
                      type="text" 
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="123 EV Street"
                      className="w-full bg-[#14202D] border border-[#212A33] text-[#F6F9FC] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#68E371] transition-colors placeholder-[#304050]"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-[2]">
                    <label className="block text-xs font-medium text-[#8F9AA4] mb-1.5">City</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6E85]" />
                      <input 
                        type="text" 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="San Francisco"
                        className="w-full bg-[#14202D] border border-[#212A33] text-[#F6F9FC] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#68E371] transition-colors placeholder-[#304050]"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-[#8F9AA4] mb-1.5">Province/State</label>
                    <div className="relative">
                      <Map className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6E85]" />
                      <input 
                        type="text" 
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        placeholder="CA"
                        className="w-full bg-[#14202D] border border-[#212A33] text-[#F6F9FC] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#68E371] transition-colors placeholder-[#304050]"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-[#8F9AA4] mb-1.5">Country</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6E85]" />
                      <input 
                        type="text" 
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="USA"
                        className="w-full bg-[#14202D] border border-[#212A33] text-[#F6F9FC] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#68E371] transition-colors placeholder-[#304050]"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-[#8F9AA4] mb-1.5">ZIP Code</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6E85]" />
                      <input 
                        type="text" 
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        placeholder="94105"
                        className="w-full bg-[#14202D] border border-[#212A33] text-[#F6F9FC] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#68E371] transition-colors placeholder-[#304050]"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8F9AA4] mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6E85]" />
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-[#14202D] border border-[#212A33] text-[#F6F9FC] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#68E371] transition-colors placeholder-[#304050]"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#68E371] hover:bg-[#52c95b] text-[#050C13] font-bold py-3 rounded-xl mt-6 transition-colors shadow-[0_0_20px_rgba(104,227,113,0.15)]"
                >
                  Complete Checkout
                </button>
              </form>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

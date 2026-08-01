import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ShoppingBag, FileText } from 'lucide-react';
import { useCart } from '../context/CartContext';

export function OrderConfirmationPage() {
  const { lastOrder } = useCart();

  return (
    <div className="min-h-screen bg-[#040A11] pt-24 pb-12 px-4 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full bg-[#0B151F] border border-[#212A33] rounded-3xl p-6 sm:p-8 shadow-2xl"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-[#68E371]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-[#68E371]" />
          </div>
          
          <h1 className="text-2xl font-display font-bold text-[#F6F9FC] mb-2">
            Order Confirmed!
          </h1>
          
          <p className="text-[#8F9AA4] text-sm mb-6 leading-relaxed">
            Your order is confirmed and placed. You will be notified via email once your vehicle has been shipped.
          </p>
        </div>

        {/* Detailed Order Summary */}
        {lastOrder && lastOrder.items.length > 0 && (
          <div className="bg-[#14202D]/60 border border-[#212A33] rounded-2xl p-4 mb-6 space-y-4 text-left">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#68E371]">Order Summary</h2>
            
            <div className="space-y-3">
              {lastOrder.items.map((item) => (
                <div key={item.vin} className="bg-[#0B151F] border border-[#212A33] rounded-xl p-3 space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold text-[#F6F9FC]">
                    <span>{item.brand} {item.model} ({item.year}) {item.quantity > 1 ? `x${item.quantity}` : ''}</span>
                    <span>${(item.basePrice * item.quantity).toLocaleString()}</span>
                  </div>
                  {item.selectedParts && item.selectedParts.length > 0 && (
                    <div className="space-y-1 pt-1.5 border-t border-[#212A33]">
                      <span className="text-[11px] font-semibold text-[#8F9AA4]">Selected Custom Parts:</span>
                      {item.selectedParts.map((part) => (
                        <div key={part.id} className="flex justify-between text-xs text-[#8F9AA4] pl-2">
                          <span>+ {part.name}</span>
                          <span className="text-[#F6F9FC]">+${(part.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#212A33] space-y-1.5 text-xs text-[#8F9AA4]">
              <div className="flex justify-between">
                <span>Vehicles & Upgrades</span>
                <span className="text-[#F6F9FC] font-semibold">${lastOrder.vehiclesAndUpgradesPrice.toLocaleString()}</span>
              </div>

              {lastOrder.taxes !== undefined && (
                <div className="flex justify-between">
                  <span>Taxes (15%)</span>
                  <span className="text-[#F6F9FC] font-semibold">${lastOrder.taxes.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-bold text-[#F6F9FC] pt-1 border-t border-[#212A33]">
                <span>Total Paid</span>
                <span className="text-[#68E371]">${lastOrder.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Link
            to="/shop"
            className="w-full bg-[#68E371] hover:bg-[#52c95b] text-[#050C13] font-bold py-3.5 rounded-xl transition-all duration-200 shadow-[0_0_20px_rgba(104,227,113,0.15)] flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            Continue Shopping
          </Link>
          
          <Link
            to="/order-history"
            className="w-full bg-[#14202D] hover:bg-[#212A33] text-[#F6F9FC] font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 border border-[#212A33]"
          >
            <FileText className="w-5 h-5" />
            View Order Details
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

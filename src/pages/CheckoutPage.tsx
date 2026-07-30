import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, vehiclesAndUpgradesPrice, totalPrice, shippingAddress, clearCart, setLastOrder } = useCart();
  const { addOrder } = useOrder();
  const { currentUser } = useAuth();
  
  const [firstName, setFirstName] = useState(currentUser?.username || '');
  const [lastName, setLastName] = useState('');

  // Mock VAT Calculation
  const subTotal = totalPrice;
  const vat = 0; // Flat 0% for now
  const finalTotal = subTotal + vat;

  const [paymentMethod, setPaymentMethod] = useState('visa');

  const paymentOptions = [
    { id: 'visa', name: 'VISA', color: 'bg-blue-600' },
    { id: 'mastercard', name: 'Mastercard', color: 'bg-orange-500' },
    { id: 'paypal', name: 'PayPal', color: 'bg-blue-800' },
    { id: 'apple', name: 'Apple Pay', color: 'bg-zinc-800' },
    { id: 'paypass', name: 'Paypass', color: 'bg-emerald-500' },
  ];

  const handleConfirmAndPay = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to CartContext for the confirmation page
    setLastOrder({
      items: cartItems,
      vehiclesAndUpgradesPrice,
      totalPrice,
      shippingAddress,
    });

    if (currentUser) {
      const orderPayload = {
        address: {
          street: shippingAddress?.street || '123 Test St',
          city: shippingAddress?.city || 'Toronto',
          province: shippingAddress?.province || 'Ontario',
          country: shippingAddress?.country || 'Canada',
          zip: shippingAddress?.zip || 'M5J 3A5',
          phone: '416-555-5555'
        },
        fname: firstName,
        lname: lastName,
        finalPrice: finalTotal,
        paymentMethod: paymentMethod === 'visa' ? 'Credit' : paymentMethod,
      };

      const success = await addOrder(orderPayload);
      if (success) {
        clearCart();
        navigate('/order-confirmation');
      } else {
        alert("There was an issue processing your order.");
      }
    } else {
      alert("Please log in to checkout.");
    }
  };

  return (
    <div className="min-h-screen bg-[#040A11] pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-[#14202D] rounded-full transition-colors text-[#F6F9FC]"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-display font-bold text-[#F6F9FC]">Checkout</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Payment Details */}
          <div className="space-y-8">
            <div className="bg-[#0B151F] border border-[#212A33] rounded-3xl p-6">
              <h2 className="text-xl font-display font-bold text-[#F6F9FC] mb-6">Payment Method</h2>
              
              <div className="flex flex-wrap gap-3 mb-8">
                {paymentOptions.map((opt) => (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setPaymentMethod(opt.id)}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                      paymentMethod === opt.id 
                        ? `${opt.color} text-white shadow-lg scale-105` 
                        : 'bg-[#14202D] text-[#8F9AA4] hover:bg-[#212A33]'
                    }`}
                  >
                    {opt.name}
                  </button>
                ))}
              </div>

              <form id="payment-form" onSubmit={handleConfirmAndPay} className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-[#8F9AA4] mb-1.5">First Name</label>
                    <input 
                      type="text" 
                      placeholder="Tom"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-[#14202D] border border-[#212A33] text-[#F6F9FC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#68E371] transition-colors placeholder-[#304050]"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-[#8F9AA4] mb-1.5">Last Name</label>
                    <input 
                      type="text" 
                      placeholder="Hanks"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-[#14202D] border border-[#212A33] text-[#F6F9FC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#68E371] transition-colors placeholder-[#304050]"
                      required
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Order Summary & Address */}
          <div className="space-y-8">
            <div className="bg-[#0B151F] border border-[#212A33] rounded-3xl p-6">
              <h2 className="text-xl font-display font-bold text-[#F6F9FC] mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {/* Itemized Breakdown */}
                {cartItems.map((item) => (
                  <div key={item.vin} className="bg-[#14202D] border border-[#212A33] rounded-xl p-3.5 space-y-2">
                    <div className="flex justify-between items-center text-sm font-bold text-[#F6F9FC]">
                      <span>{item.brand} {item.model} ({item.year}) {item.quantity > 1 ? `x${item.quantity}` : ''}</span>
                      <span>${(item.basePrice * item.quantity).toLocaleString()}</span>
                    </div>
                    {item.selectedParts && item.selectedParts.length > 0 && (
                      <div className="space-y-1.5 pt-1.5 border-t border-[#212A33]">
                        <span className="text-[11px] font-semibold uppercase text-[#68E371] tracking-wider block">Custom Parts / Upgrades</span>
                        {item.selectedParts.map((part) => (
                          <div key={part.id} className="flex justify-between text-xs text-[#8F9AA4] pl-2">
                            <span>+ {part.name}</span>
                            <span>+${(part.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <div className="pt-2 space-y-2">
                  <div className="flex justify-between text-[#8F9AA4]">
                    <span>Vehicles & Upgrades</span>
                    <span className="text-[#F6F9FC] font-semibold">${vehiclesAndUpgradesPrice.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-[#8F9AA4]">
                    <span>Sub Total</span>
                    <span className="text-[#F6F9FC] font-semibold">${subTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#8F9AA4]">
                    <span>VAT</span>
                    <span className="text-[#F6F9FC] font-semibold">${vat.toLocaleString()}</span>
                  </div>
                </div>

                <div className="h-px bg-[#212A33] my-4" />
                <div className="flex justify-between text-[#F6F9FC] text-lg font-bold">
                  <span>Total</span>
                  <span className="text-[#68E371]">${finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {shippingAddress && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-[#F6F9FC]">Shipping Address</label>
                  </div>
                  
                  <div className="p-4 rounded-xl border bg-[#14202D] border-[#212A33] text-[#F6F9FC] transition-colors">
                    <p className="text-sm">
                      {shippingAddress.street}, {shippingAddress.city}, {shippingAddress.province} {shippingAddress.zip}, {shippingAddress.country}
                    </p>
                  </div>
                </div>
              )}

              <button 
                type="submit"
                form="payment-form"
                className="w-full bg-[#68E371] hover:bg-[#52c95b] text-[#050C13] font-bold py-4 rounded-xl mt-8 transition-colors shadow-[0_0_20px_rgba(104,227,113,0.15)] flex justify-center items-center gap-2"
              >
                <ShieldCheck className="w-5 h-5" />
                Confirm & Pay
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

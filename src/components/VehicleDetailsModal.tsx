import { useState, useEffect } from 'react';
import { X, Star, Zap, ShoppingBag, Info, Plus, Check, Car, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
// Removed unused useOrder import
import type { FrontendVehicle, CustomPart } from '../types';

export type VehicleDetail = FrontendVehicle;

interface VehicleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: VehicleDetail | null;
}

export function VehicleDetailsModal({ isOpen, onClose, vehicle }: VehicleDetailsModalProps) {
  const { addToCart, setIsCartOpen } = useCart();
  
  const [selectedParts, setSelectedParts] = useState<CustomPart[]>([]);
  const [availableParts, setAvailableParts] = useState<CustomPart[]>([]);
  const [vehicleReviews, setVehicleReviews] = useState<any[]>([]);
  const [vehicleInventory, setVehicleInventory] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL;

  const activeInventoryItem = vehicleInventory.find(inv => inv.mileage > 0) || vehicleInventory.find(inv => inv.available) || vehicleInventory[0];
  const displayedKm = activeInventoryItem?.mileage || vehicle?.km || 0;
  const isUsedVehicle = activeInventoryItem?.used ?? (vehicle?.condition === 'used');

  // Reset selected parts and fetch new data when modal opens/closes or vehicle changes
  useEffect(() => {
    setSelectedParts([]);
    
    if (isOpen && vehicle) {
      // fetch parts
      fetch(`${API_URL}/vehicle/parts/${vehicle.id}`)
        .then(r => r.json())
        .then(data => {
          const parts = data.map((p: any) => ({
            id: String(p.id),
            name: p.name,
            description: p.description,
            price: p.partPrice
          }));
          setAvailableParts(parts);
        })
        .catch(console.error);

      // fetch reviews
      fetch(`${API_URL}/vehicle/reviews/${vehicle.id}`)
        .then(r => r.json())
        .then(data => {
          setVehicleReviews(data);
          if (data.length > 0) {
            const avg = data.reduce((acc: number, r: any) => acc + r.starRating, 0) / data.length;
            setAverageRating(avg);
          } else {
            setAverageRating(0);
          }
        })
        .catch(console.error);

      // fetch inventory
      fetch(`${API_URL}/vehicle/inventory/${vehicle.id}`)
        .then(r => r.json())
        .then(setVehicleInventory)
        .catch(console.error);
    }
  }, [isOpen, vehicle, API_URL]);

  const togglePart = (part: CustomPart) => {
    setSelectedParts((current) => 
      current.some(p => p.id === part.id)
        ? current.filter(p => p.id !== part.id)
        : [...current, part]
    );
  };

  const handleAddToCart = () => {
    if (vehicle) {
      // Find an available inventory item
      const availableVin = vehicleInventory.find(inv => inv.available)?.vin;
      
      if (!availableVin) {
        alert("Sorry, this vehicle is out of stock!");
        return;
      }

      addToCart({
        ...vehicle,
        vin: availableVin, // assign real vin from backend
        selectedParts,
        availableParts
      });
      onClose();
      setIsCartOpen(true);
    }
  };

  const totalCustomizationPrice = selectedParts.reduce((sum, part) => sum + part.price, 0);
  const estimatedTotal = (vehicle?.basePrice || 0) + totalCustomizationPrice;
  
  return (
    <AnimatePresence>
      {isOpen && vehicle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          {/* Blurred overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-[#040A11]/80 backdrop-blur-md"
            onClick={onClose}
          />
          
          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-[#0B151F] border border-[#212A33] rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-10 text-[#8F9AA4] hover:text-[#F6F9FC] bg-[#0B151F]/80 backdrop-blur rounded-full p-2 transition-colors border border-[#212A33]"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Side: Image */}
            <div className="w-full md:w-1/2 relative bg-[#14202D] aspect-video md:aspect-auto h-64 md:h-auto">
              <img 
                src={vehicle.image} 
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-electric-gradient text-[#050C13] text-xs font-bold px-3 py-1 rounded-full shadow-md">
                {vehicle.condition === 'new' ? 'New' : 'Used'}
              </div>
            </div>

            {/* Right Side: Details */}
            <div className="w-full md:w-1/2 flex flex-col overflow-y-auto">
              <div className="p-6 md:p-8 flex-1">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="font-display text-3xl font-bold text-[#F6F9FC] mb-1">
                      {vehicle.brand} {vehicle.model}
                    </h2>
                    <p className="text-sm text-[#8F9AA4]">
                      {vehicle.description} &middot; {vehicle.horsePower} HP
                    </p>
                    <p className="text-xs text-[#8F9AA4] mt-1">
                      VIN: {activeInventoryItem?.vin || vehicle.vin} &middot; {vehicle.year} &middot; {isUsedVehicle ? `${displayedKm.toLocaleString()} km` : 'New Model'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold bg-[#14202D] px-3 py-1.5 rounded-lg border border-[#212A33]">
                    <Star className={`w-4 h-4 ${averageRating > 0 ? 'text-[#68E371] fill-[#68E371]' : 'text-[#8F9AA4]'}`} />
                    <span className="text-[#F6F9FC]">
                      {averageRating > 0 ? averageRating.toFixed(1) : '0'}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-8 p-4 bg-[#14202D] rounded-2xl border border-[#212A33]">
                  <p className="text-xs text-[#8F9AA4] uppercase tracking-wider font-semibold mb-1">Vehicle Price</p>
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-4xl font-bold text-[#F6F9FC]">
                      ${vehicle.basePrice.toLocaleString()}
                    </span>
                    {vehicle.originalPrice && (
                      <span className="text-[#8F9AA4] line-through text-lg">
                        ${vehicle.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Key Specs */}
                <div className="space-y-4 mb-8">
                  <h3 className="text-sm font-bold text-[#F6F9FC] uppercase tracking-wider">Key Specifications</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-[#0A121A] rounded-xl border border-[#212A33] flex flex-col items-center text-center">
                      <Car className="w-6 h-6 text-[#68E371] mb-2" />
                      <span className="text-lg font-bold text-[#F6F9FC] truncate max-w-[100px] md:max-w-full" title={vehicle.brand}>{vehicle.brand}</span>
                      <span className="text-xs text-[#8F9AA4]">Brand</span>
                    </div>
                    <div className="p-4 bg-[#0A121A] rounded-xl border border-[#212A33] flex flex-col items-center text-center">
                      <Zap className="w-6 h-6 text-[#68E371] mb-2" />
                      <span className="text-lg font-bold text-[#F6F9FC]">{vehicle.horsePower} HP</span>
                      <span className="text-xs text-[#8F9AA4]">Horsepower</span>
                    </div>
                    <div className="p-4 bg-[#0A121A] rounded-xl border border-[#212A33] flex flex-col items-center text-center">
                      <Activity className="w-6 h-6 text-[#68E371] mb-2" />
                      <span className="text-lg font-bold text-[#F6F9FC]">{displayedKm > 0 ? `${displayedKm.toLocaleString()} km` : '0 km'}</span>
                      <span className="text-xs text-[#8F9AA4]">Mileage</span>
                    </div>
                  </div>
                </div>

                {/* Customizations */}
                {availableParts && availableParts.length > 0 && (
                  <div className="space-y-4 mb-8">
                    <h3 className="text-sm font-bold text-[#F6F9FC] uppercase tracking-wider">Customizations</h3>
                    <div className="space-y-3">
                      {availableParts.map((part) => {
                        const isSelected = selectedParts.some(p => p.id === part.id);
                        return (
                          <button
                            key={part.id}
                            onClick={() => togglePart(part)}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                              isSelected 
                                ? 'bg-[#68E371]/10 border-[#68E371]' 
                                : 'bg-[#0A121A] border-[#212A33] hover:border-[#68E371]/50'
                            }`}
                          >
                            <div>
                              <div className="font-bold text-[#F6F9FC] flex items-center gap-2">
                                {part.name}
                                {isSelected && <Check className="w-4 h-4 text-[#68E371]" />}
                              </div>
                              <div className="text-xs text-[#8F9AA4] mt-1">{part.description}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-[#F6F9FC]">+${part.price.toLocaleString()}</span>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                                isSelected 
                                  ? 'bg-[#68E371] border-[#68E371] text-[#050C13]' 
                                  : 'bg-[#14202D] border-[#212A33] text-[#8F9AA4]'
                              }`}>
                                {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Reviews */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#F6F9FC] uppercase tracking-wider">Customer Reviews</h3>
                    <span className="text-xs text-[#8F9AA4] bg-[#14202D] px-2 py-1 rounded-md border border-[#212A33]">
                      {vehicleReviews.length} {vehicleReviews.length === 1 ? 'Review' : 'Reviews'}
                    </span>
                  </div>
                  
                  {vehicleReviews.length === 0 ? (
                    <div className="text-center p-6 bg-[#0A121A] rounded-xl border border-[#212A33]">
                      <Star className="w-8 h-8 text-[#212A33] mx-auto mb-2" />
                      <p className="text-sm text-[#8F9AA4]">No reviews yet for this model.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {vehicleReviews.map(review => {
                        const ratingValue = review.starRating ?? review.rating ?? 0;
                        const textValue = review.description ?? review.text ?? review.reviewText ?? '';
                        const dateValue = review.reviewDate ?? review.createdAt ?? new Date().toISOString();
                        
                        return (
                          <div key={review.id} className="p-4 bg-[#0A121A] rounded-xl border border-[#212A33]">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <Star 
                                    key={star} 
                                    className={`w-3.5 h-3.5 ${star <= ratingValue ? 'fill-[#68E371] text-[#68E371]' : 'text-[#212A33]'}`} 
                                  />
                                ))}
                              </div>
                              <span className="text-[10px] text-[#8F9AA4] uppercase tracking-wider">
                                {new Date(dateValue).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-[#F6F9FC] italic">"{textValue}"</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                {/* Information Callout */}
                <div className="flex gap-3 p-4 bg-[#68E371]/10 rounded-xl border border-[#68E371]/20">
                  <Info className="w-5 h-5 text-[#68E371] flex-shrink-0" />
                  <p className="text-xs text-[#8F9AA4] leading-relaxed">
                    All our vehicles come with a comprehensive 150-point inspection, battery health certificate, and a minimum 12-month limited warranty. Deposits are 100% refundable.
                  </p>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 md:p-8 border-t border-[#212A33] mt-auto">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[#8F9AA4] font-semibold">Estimated Total</span>
                  <span className="font-display text-2xl font-bold text-[#F6F9FC]">
                    ${estimatedTotal.toLocaleString()}
                  </span>
                </div>
                <button 
                  onClick={handleAddToCart}
                  className="w-full bg-[#68E371] hover:bg-[#52c95b] text-[#050C13] font-bold py-4 rounded-xl transition-all duration-200 shadow-[0_0_20px_rgba(104,227,113,0.15)] flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

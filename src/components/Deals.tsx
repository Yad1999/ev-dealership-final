import { useState, useEffect } from 'react';
import { Zap, Star, ArrowRight, Car, Activity } from 'lucide-react';
import { VehicleDetailsModal } from './VehicleDetailsModal';
// removed useOrder

import type { FrontendVehicle } from '../types';

export type Deal = FrontendVehicle & {
  tag: string;
};



export const Deals = () => {
  const [dealsData, setDealsData] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<FrontendVehicle | null>(null);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/vehicle/search?onSale=true`)
      .then(r => r.json())
      .then(async (data: any[]) => {
        const tags = ['Hot Deal', "Editor's Pick", 'Best Value'];
        const mappedPromises = data.slice(0, 3).map(async (v, idx) => {
          let avgRating = 0;
          try {
            const revRes = await fetch(`${API_URL}/vehicle/reviews/${v.id}`);
            const reviews = await revRes.json();
            if (reviews.length > 0) {
              avgRating = reviews.reduce((acc: number, r: any) => acc + r.starRating, 0) / reviews.length;
            }
          } catch (e) {
            console.error(`Error fetching reviews for vehicle ${v.id}`, e);
          }

          let km = 0;
          let condition: 'new' | 'used' = 'new';
          try {
            const invRes = await fetch(`${API_URL}/vehicle/inventory/${v.id}`);
            const invData = await invRes.json();
            if (Array.isArray(invData) && invData.length > 0) {
              const usedItem = invData.find((inv: any) => inv.used && inv.mileage > 0);
              if (usedItem) {
                km = usedItem.mileage;
                condition = 'used';
              } else {
                const itemWithMileage = invData.find((inv: any) => inv.mileage > 0);
                if (itemWithMileage) {
                  km = itemWithMileage.mileage;
                }
              }
            }
          } catch (e) {
            console.error(`Error fetching inventory for vehicle ${v.id}`, e);
          }

          return {
            id: v.id,
            vin: String(v.id),
            brand: v.brand,
            model: v.model,
            description: v.description,
            year: parseInt(v.year) || 2024,
            condition,
            basePrice: v.discountedPrice || v.price,
            originalPrice: v.discountPercent > 0 ? v.price : undefined,
            rating: avgRating,
            image: v.vehicleimages?.find((img: any) => img.thumbnail)?.imageUrl || v.vehicleimages?.[0]?.imageUrl || '',
            km,
            horsePower: v.horsePower,
            availableParts: [],
            tag: tags[idx % tags.length]
          } as Deal;
        });
        
        const mapped = await Promise.all(mappedPromises);
        setDealsData(mapped);
      })
      .catch(console.error);
  }, []);

  return (
    <section id="deals" className="py-20 md:py-24 border-t border-[#212A33]/50 bg-[#040A11]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#F6F9FC]">
              This week's <span className="text-gradient">top volts.</span>
            </h2>
          </div>

          <a
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#68E371] hover:text-[#00C2CE] transition-colors duration-200 group"
          >
            Browse all listings
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </a>
        </div>

        {/* Deals Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dealsData.map((deal) => {
            const averageRating = deal.rating;

            return (
            <div
              key={deal.vin}
              className="group bg-[#0B151F] border border-[#212A33] rounded-2xl overflow-hidden hover:border-[#68E371] hover:-translate-y-1 hover:shadow-glow transition-all duration-300 flex flex-col"
            >
              {/* Media Image Container */}
              <div className="relative aspect-[4/3] bg-[#14202D] overflow-hidden">
                <img
                  src={deal.image}
                  alt={`${deal.brand} ${deal.model}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Badge Overlay */}
                <div className="absolute top-4 left-4 bg-electric-gradient text-[#050C13] text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  {deal.tag}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Title & Rating */}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-xl font-bold text-[#F6F9FC] group-hover:text-[#68E371] transition-colors">
                      {deal.brand} {deal.model}
                    </h3>
                    <div className="flex items-center gap-1 text-sm font-semibold text-[#8F9AA4]">
                      <Star className={`w-4 h-4 ${averageRating > 0 ? 'text-[#68E371] fill-[#68E371]' : 'text-[#8F9AA4]'}`} />
                      <span className={averageRating > 0 ? 'text-[#F6F9FC]' : ''}>
                        {averageRating > 0 ? averageRating.toFixed(1) : '0'}
                      </span>
                    </div>
                  </div>

                  {/* Subtitle */}
                  <p className="text-sm text-[#8F9AA4] mt-1">{deal.year} &middot; {deal.condition === 'new' ? 'New' : 'Used'}</p>

                  {/* Specs Row */}
                  <div className="mt-4 pt-4 border-t border-[#212A33]/60 flex flex-wrap items-center gap-4 text-xs text-[#8F9AA4]">
                    <div className="flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-[#68E371]" />
                      <span>{deal.brand}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#68E371]" />
                      <span>{deal.horsePower} HP</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-[#68E371]" />
                      <span>{deal.km.toLocaleString()} km</span>
                    </div>
                  </div>
                </div>

                {/* Price & Action Row */}
                <div className="mt-6 pt-4 border-t border-[#212A33] flex items-center justify-between">
                  <div>
                    <div className="font-display text-2xl font-bold text-[#F6F9FC]">
                      ${deal.basePrice.toLocaleString()}
                    </div>
                    {deal.originalPrice && (
                      <div className="text-xs text-[#8F9AA4] line-through mt-0.5">
                        ${deal.originalPrice.toLocaleString()}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedDeal(deal)}
                    className="bg-[#14202D] hover:bg-[#68E371] text-[#F6F9FC] hover:text-[#050C13] text-sm font-semibold px-6 py-2 rounded-lg transition-all duration-200 shadow-sm"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      <VehicleDetailsModal 
        isOpen={!!selectedDeal} 
        onClose={() => setSelectedDeal(null)} 
        vehicle={selectedDeal} 
      />
    </section>
  );
};

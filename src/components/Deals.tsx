import { useState } from 'react';
import { Zap, Gauge, Star, ArrowRight } from 'lucide-react';
import { VehicleDetailsModal } from './VehicleDetailsModal';

import type { FrontendVehicle } from '../types';

export type Deal = FrontendVehicle & {
  tag: string;
};

const dealsData: Deal[] = [
  {
    vin: '11111111122',
    brand: 'TestBrand',
    model: 'TestModel',
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80',
    tag: 'Hot Deal',
    year: 2024,
    condition: 'new',
    basePrice: 46900,
    originalPrice: 52400,
    range: 663,
    speed: 3.8,
    rating: 4.9,
    km: 0,
    horsePower: 200,
    description: 'This is a test car.',
    availableParts: [{ id: 'p1', name: 'Better Battery', description: 'This battery offers 3x performance', price: 1000 }, { id: 'p2', name: 'Premium Wheels', description: 'Sporty alloy wheels', price: 1500 }]
  },
  {
    vin: '11111111123',
    brand: 'Volt',
    model: 'Sedan GT',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80',
    tag: "Editor's Pick",
    year: 2024,
    condition: 'new',
    basePrice: 38200,
    originalPrice: 44900,
    range: 576,
    speed: 2.9,
    rating: 4.8,
    km: 0,
    horsePower: 350,
    description: 'Sleek electric performance.',
    availableParts: [{ id: 'p3', name: 'Carbon Fiber Trim', description: 'Lightweight interior trim', price: 800 }]
  },
  {
    vin: '11111111124',
    brand: 'Micro',
    model: 'Bolt EV',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
    tag: 'Best Value',
    year: 2023,
    condition: 'used',
    basePrice: 19750,
    originalPrice: 23000,
    range: 354,
    speed: 6.5,
    rating: 4.7,
    km: 19000,
    horsePower: 150,
    description: 'Perfect city commuter.',
    availableParts: []
  },
];

export const Deals = () => {
  const [selectedDeal, setSelectedDeal] = useState<FrontendVehicle | null>(null);

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
          {dealsData.map((deal) => (
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
                      <Star className="w-4 h-4 fill-[#68E371] text-[#68E371]" />
                      <span>{deal.rating}</span>
                    </div>
                  </div>

                  {/* Subtitle */}
                  <p className="text-sm text-[#8F9AA4] mt-1">{deal.year} &middot; {deal.condition === 'new' ? 'New' : 'Used'}</p>

                  {/* Specs Row */}
                  <div className="mt-4 pt-4 border-t border-[#212A33]/60 flex items-center gap-4 text-xs text-[#8F9AA4]">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#68E371]" />
                      <span>{deal.range} km range</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-[#68E371]" />
                      <span>{deal.speed}s 0-100 km/h</span>
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
          ))}
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

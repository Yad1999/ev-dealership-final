import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Zap, Gauge, Star } from 'lucide-react';
import { VehicleDetailsModal } from '../components/VehicleDetailsModal';

import type { FrontendVehicle } from '../types';

type Condition = 'all' | 'new' | 'used';

const mockVehicles: FrontendVehicle[] = [
  {
    vin: '11111111122', brand: 'TestBrand', model: 'TestModel', condition: 'new', basePrice: 46900, originalPrice: 52400,
    range: 663, speed: 3.8, rating: 4.9, year: 2024, km: 0, horsePower: 200, description: 'This is a test car.',
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80',
    availableParts: [{ id: 'p1', name: 'Better Battery', description: 'This battery offers 3x performance', price: 1000 }, { id: 'p2', name: 'Premium Wheels', description: 'Sporty alloy wheels', price: 1500 }]
  },
  {
    vin: '11111111123', brand: 'Volt', model: 'Sedan GT', condition: 'new', basePrice: 38200, originalPrice: 44900,
    range: 576, speed: 2.9, rating: 4.8, year: 2024, km: 0, horsePower: 350, description: 'Sleek electric performance.',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80',
    availableParts: [{ id: 'p3', name: 'Carbon Fiber Trim', description: 'Lightweight interior trim', price: 800 }]
  },
  {
    vin: '11111111124', brand: 'Micro', model: 'Bolt EV', condition: 'used', basePrice: 19750, originalPrice: 23000,
    range: 354, speed: 6.5, rating: 4.7, year: 2023, km: 19000, horsePower: 150, description: 'Perfect city commuter.',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
    availableParts: []
  },
  {
    vin: '11111111125', brand: 'Stellar', model: 'Model S', condition: 'used', basePrice: 55000, originalPrice: 85000,
    range: 627, speed: 2.4, rating: 4.9, year: 2022, km: 50000, horsePower: 500, description: 'Luxury meets speed.',
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    availableParts: [{ id: 'p4', name: 'Autopilot Plus', description: 'Enhanced autonomous driving', price: 3000 }]
  },
  {
    vin: '11111111126', brand: 'Aero', model: 'Coupe', condition: 'new', basePrice: 41500,
    range: 498, speed: 4.2, rating: 4.6, year: 2024, km: 0, horsePower: 280, description: 'Sporty aerodynamic design.',
    image: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    availableParts: [{ id: 'p5', name: 'Sport Suspension', description: 'Tighter cornering control', price: 1200 }]
  },
  {
    vin: '11111111127', brand: 'Terra', model: 'Truck EV', condition: 'used', basePrice: 62000, originalPrice: 75000,
    range: 514, speed: 4.5, rating: 4.8, year: 2024, km: 13600, horsePower: 450, description: 'Built for work and off-road.',
    image: 'https://images.unsplash.com/photo-1612444646734-706bc32eb681?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    availableParts: [{ id: 'p6', name: 'Tow Hitch', description: 'Class IV hitch receiver', price: 500 }, { id: 'p7', name: 'Bed Liner', description: 'Durable spray-in liner', price: 600 }]
  },
  {
    vin: '11111111128', brand: 'Nimbus', model: 'City', condition: 'new', basePrice: 25000,
    range: 402, speed: 5.8, rating: 4.5, year: 2024, km: 0, horsePower: 180, description: 'Compact and efficient.',
    image: 'https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    availableParts: []
  },
  {
    vin: '11111111129', brand: 'Eco', model: 'Van Max', condition: 'used', basePrice: 34000, originalPrice: 42000,
    range: 450, speed: 6.0, rating: 4.3, year: 2021, km: 72400, horsePower: 220, description: 'Spacious electric cargo van.',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    availableParts: [{ id: 'p8', name: 'Roof Rack', description: 'Heavy duty cargo rack', price: 900 }]
  },
  {
    vin: '11111111130', brand: 'Volt', model: 'Crossover', condition: 'new', basePrice: 39900,
    range: 531, speed: 4.8, rating: 4.7, year: 2024, km: 0, horsePower: 260, description: 'Versatile family EV.',
    image: 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    availableParts: []
  },
  {
    vin: '11111111131', brand: 'Aurora', model: 'Sport', condition: 'used', basePrice: 29500, originalPrice: 38000,
    range: 466, speed: 3.5, rating: 4.4, year: 2020, km: 83600, horsePower: 310, description: 'Affordable electric sports car.',
    image: 'https://images.unsplash.com/photo-1554744512-d6c603f27c54?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    availableParts: []
  },
  {
    vin: '11111111132', brand: 'Vanguard', model: 'Elite', condition: 'new', basePrice: 89000,
    range: 724, speed: 2.1, rating: 5.0, year: 2024, km: 0, horsePower: 650, description: 'Premium hyper EV.',
    image: 'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    availableParts: [{ id: 'p9', name: 'Track Package', description: 'High-performance tires & brakes', price: 4500 }]
  },
  {
    vin: '11111111133', brand: 'Ozone', model: 'Hatchback', condition: 'used', basePrice: 18000, originalPrice: 22000,
    range: 289, speed: 7.2, rating: 4.1, year: 2019, km: 109000, horsePower: 130, description: 'Budget friendly commuter.',
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    availableParts: []
  }
];

export function Shop() {
  const [selectedVehicle, setSelectedVehicle] = useState<FrontendVehicle | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const conditionQuery = searchParams.get('condition') as Condition | null;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<Condition>(conditionQuery && ['new', 'used'].includes(conditionQuery) ? conditionQuery : 'all');

  // Update URL and state when filter changes
  const handleFilterChange = (condition: Condition) => {
    setActiveFilter(condition);
    if (condition === 'all') {
      searchParams.delete('condition');
    } else {
      searchParams.set('condition', condition);
    }
    setSearchParams(searchParams);
  };

  // Sync state if URL changes directly
  useEffect(() => {
    if (conditionQuery && ['new', 'used'].includes(conditionQuery)) {
      setActiveFilter(conditionQuery);
    } else {
      setActiveFilter('all');
    }
  }, [conditionQuery]);

  const filteredVehicles = useMemo(() => {
    return mockVehicles.filter(v => {
      const matchesSearch = v.brand.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            v.model.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCondition = activeFilter === 'all' || v.condition === activeFilter;
      return matchesSearch && matchesCondition;
    });
  }, [searchQuery, activeFilter]);

  return (
    <div className="min-h-screen bg-[#040A11] pt-28 pb-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Controls */}
        <div className="mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-[#F6F9FC] mb-8">
            Shop <span className="text-gradient">VoltMarket</span>
          </h1>
          
          <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-[#0B151F] p-4 rounded-2xl border border-[#212A33]">
            {/* Search Bar */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8F9AA4]" />
              <input 
                type="text" 
                placeholder="Search models (e.g. Volt Sedan)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#14202D] border border-[#212A33] text-[#F6F9FC] placeholder-[#8F9AA4] rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-[#68E371] transition-colors"
              />
            </div>

            {/* Condition Filters */}
            <div className="flex bg-[#14202D] rounded-xl p-1 border border-[#212A33] w-full md:w-auto">
              <button 
                onClick={() => handleFilterChange('all')}
                className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'all' ? 'bg-[#68E371] text-[#050C13]' : 'text-[#8D9CAE] hover:text-[#F6F9FC]'}`}
              >
                All Inventory
              </button>
              <button 
                onClick={() => handleFilterChange('new')}
                className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'new' ? 'bg-[#68E371] text-[#050C13]' : 'text-[#8D9CAE] hover:text-[#F6F9FC]'}`}
              >
                New EVs
              </button>
              <button 
                onClick={() => handleFilterChange('used')}
                className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'used' ? 'bg-[#68E371] text-[#050C13]' : 'text-[#8D9CAE] hover:text-[#F6F9FC]'}`}
              >
                Used EVs
              </button>
            </div>
          </div>
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle.vin} className="group bg-[#0B151F] border border-[#212A33] rounded-2xl overflow-hidden hover:border-[#68E371] hover:-translate-y-1 hover:shadow-glow transition-all duration-300 flex flex-col">
              
              {/* Media Image Container */}
              <div className="relative aspect-[4/3] bg-[#14202D] overflow-hidden">
                <img 
                  src={vehicle.image} 
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Badge Overlay */}
                <div className="absolute top-4 left-4 bg-electric-gradient text-[#050C13] text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  {vehicle.condition === 'new' ? 'New' : 'Used'}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Title & Rating */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-display text-xl font-bold text-[#F6F9FC] group-hover:text-[#68E371] transition-colors line-clamp-1">
                      {vehicle.brand} {vehicle.model}
                    </h3>
                    <div className="flex items-center gap-1 text-sm font-semibold text-[#8F9AA4]">
                      <Star className="w-4 h-4 text-[#68E371] fill-[#68E371]" />
                      <span>{vehicle.rating}</span>
                    </div>
                  </div>
                  
                  {/* Subtitle */}
                  <p className="text-sm text-[#8F9AA4] mt-1">
                    {vehicle.year} &middot; {vehicle.condition === 'used' ? `${vehicle.km.toLocaleString()} km` : 'New'}
                  </p>

                  {/* Specs Row */}
                  <div className="mt-4 pt-4 border-t border-[#212A33]/60 flex items-center gap-4 text-xs text-[#8F9AA4]">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#68E371]" />
                      <span>{vehicle.range} km range</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-[#68E371]" />
                      <span>{vehicle.speed}s 0-100 km/h</span>
                    </div>
                  </div>
                </div>

                {/* Price Row */}
                <div className="mt-6 pt-4 border-t border-[#212A33] flex items-center justify-between">
                  <div>
                    <div className="font-display text-2xl font-bold text-[#F6F9FC]">
                      ${vehicle.basePrice.toLocaleString()}
                    </div>
                    {vehicle.originalPrice && (
                      <div className="text-xs text-[#8F9AA4] line-through mt-0.5">
                        ${vehicle.originalPrice.toLocaleString()}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => setSelectedVehicle(vehicle)}
                    className="bg-[#14202D] hover:bg-[#68E371] text-[#F6F9FC] hover:text-[#050C13] text-sm font-semibold px-6 py-2 rounded-lg transition-all duration-200 shadow-sm"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredVehicles.length === 0 && (
          <div className="py-24 text-center">
            <h3 className="font-display text-xl font-bold text-[#F6F9FC] mb-2">No vehicles found</h3>
            <p className="text-[#8D9CAE]">Try adjusting your filters or search query.</p>
          </div>
        )}

      </div>
      
      <VehicleDetailsModal 
        isOpen={!!selectedVehicle} 
        onClose={() => setSelectedVehicle(null)} 
        vehicle={selectedVehicle} 
      />
    </div>
  );
}

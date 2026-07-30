import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Zap, Star, Car, Activity } from 'lucide-react';
import { VehicleDetailsModal } from '../components/VehicleDetailsModal';
// removed useOrder

import type { FrontendVehicle } from '../types';

type Condition = 'all' | 'new' | 'used' | 'discounted';
type SortOrder = 'asc' | 'desc' | 'none';



export function Shop() {
  const [vehicles, setVehicles] = useState<FrontendVehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<FrontendVehicle | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const conditionQuery = searchParams.get('condition') as Condition | null;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<Condition>(conditionQuery && ['new', 'used', 'discounted'].includes(conditionQuery) ? conditionQuery : 'all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('none');

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    let url = `${API_URL}/vehicle/search?`;
    if (activeFilter === 'discounted') {
      url += `onSale=true&`;
    }
    if (searchQuery) {
      url += `keyword=${encodeURIComponent(searchQuery)}&`;
    }
    if (sortOrder === 'asc' || sortOrder === 'desc') {
      url += `sortByPrice=${sortOrder}&`;
    }

    fetch(url)
      .then(r => r.json())
      .then(async (data: any[]) => {
        const mappedPromises = data.map(async (v) => {
          let avgRating = 0;
          try {
            const revRes = await fetch(`${API_URL}/vehicle/reviews/${v.id}`);
            const revData = await revRes.json();
            if (Array.isArray(revData) && revData.length > 0) {
              avgRating = revData.reduce((acc: number, r: any) => acc + r.starRating, 0) / revData.length;
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
            vin: String(v.id), // placeholder for selection
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
            availableParts: []
          };
        });
        
        const mapped = await Promise.all(mappedPromises);

        // Frontend filtering for new/used if needed (backend doesn't support it directly)
        let filtered = mapped;
        if (activeFilter === 'new') filtered = mapped.filter(v => v.condition === 'new');
        if (activeFilter === 'used') filtered = mapped.filter(v => v.condition === 'used');

        setVehicles(filtered);
      })
      .catch(console.error);
  }, [searchQuery, activeFilter, sortOrder]);

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
    if (conditionQuery && ['new', 'used', 'discounted'].includes(conditionQuery)) {
      setActiveFilter(conditionQuery);
    } else {
      setActiveFilter('all');
    }
  }, [conditionQuery]);

  const filteredVehicles = vehicles;

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
              <button 
                onClick={() => handleFilterChange('discounted')}
                className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'discounted' ? 'bg-[#68E371] text-[#050C13]' : 'text-[#8D9CAE] hover:text-[#F6F9FC]'}`}
              >
                Discounted EVs
              </button>
            </div>
          </div>

          {/* Sorting Controls */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-[#0B151F] p-4 rounded-2xl border border-[#212A33] mt-6">
            <span className="text-[#F6F9FC] font-medium text-sm">Sort by Price:</span>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="priceSort"
                  value="asc"
                  checked={sortOrder === 'asc'}
                  onChange={() => setSortOrder('asc')}
                  className="accent-[#68E371]"
                />
                <span className="text-[#8D9CAE] text-sm hover:text-[#F6F9FC] transition-colors">Ascending</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="priceSort"
                  value="desc"
                  checked={sortOrder === 'desc'}
                  onChange={() => setSortOrder('desc')}
                  className="accent-[#68E371]"
                />
                <span className="text-[#8D9CAE] text-sm hover:text-[#F6F9FC] transition-colors">Descending</span>
              </label>
              <button
                onClick={() => setSortOrder('none')}
                className="text-sm font-medium text-[#68E371] hover:text-[#52c95b] transition-colors flex items-center ml-2 border border-[#68E371]/30 hover:border-[#68E371] px-3 py-1 rounded-full"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVehicles.map((vehicle) => {
            const averageRating = vehicle.rating;

            return (
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
                        <Star className={`w-4 h-4 ${averageRating > 0 ? 'text-[#68E371] fill-[#68E371]' : 'text-[#8F9AA4]'}`} />
                        <span className={averageRating > 0 ? 'text-[#F6F9FC]' : ''}>
                          {averageRating > 0 ? averageRating.toFixed(1) : '0'}
                        </span>
                      </div>
                    </div>
                  
                  {/* Subtitle */}
                  <p className="text-sm text-[#8F9AA4] mt-1">
                    {vehicle.year} &middot; {vehicle.condition === 'used' ? `${vehicle.km.toLocaleString()} km` : 'New'}
                  </p>

                  {/* Specs Row */}
                  <div className="mt-4 pt-4 border-t border-[#212A33]/60 flex flex-wrap items-center gap-4 text-xs text-[#8F9AA4]">
                    <div className="flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-[#68E371]" />
                      <span>{vehicle.brand}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#68E371]" />
                      <span>{vehicle.horsePower} HP</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-[#68E371]" />
                      <span>{vehicle.km.toLocaleString()} km</span>
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
            );
          })}
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

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Order, Review } from '../types';
import { useAuth } from './AuthContext';

interface OrderContextType {
  orders: Order[];
  reviews: Review[];
  addOrder: (payload: any) => Promise<boolean>;
  addReview: (vehicleId: number, reviewText: string, starRating: number) => Promise<boolean>;
  getAverageRating: (model: string) => number;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews] = useState<Review[]>([]);
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchOrders = async () => {
    if (!currentUser) {
      setOrders([]);
      return;
    }
    
    try {
      const r = await fetch(`${API_URL}/user/orders/${currentUser.id}`);
      if (!r.ok) return;
      const data = await r.json();
      
      if (data && Array.isArray(data)) {
        const mappedOrders = data.map((o: any) => ({
          id: o.id.toString(),
          userId: currentUser.id,
          datePlaced: o.orderDate ? new Date(o.orderDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown Date',
          totalAmount: o.finalPrice,
          status: o.status,
          items: o.customizedVehicle.map((cv: any) => {
            const vModel = cv.vehicleInventory.vehicleModel;
            return {
              vehicleModelId: vModel.id,
              vin: cv.vehicleInventory.vin,
              brand: vModel.brand,
              model: vModel.model,
              year: parseInt(vModel.year) || 2024,
              image: vModel.vehicleimages?.find((img: any) => img.thumbnail)?.imageUrl || vModel.vehicleimages?.[0]?.imageUrl || '',
              basePrice: vModel.discountedPrice || vModel.price,
              quantity: 1,
              selectedParts: cv.vehicleCustomParts.map((p: any) => ({
                id: String(p.id),
                name: p.name,
                description: p.description,
                price: p.partPrice
              }))
            };
          })
        }));
        setOrders(mappedOrders);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // We fetch orders whenever the user logs in
  useEffect(() => {
    fetchOrders();
  }, [currentUser, API_URL]);

  const addOrder = async (payload: any) => {
    if (!currentUser) return false;
    try {
      const res = await fetch(`${API_URL}/user/createOrder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, user: { id: currentUser.id } })
      });
      if (res.ok) {
        // Refresh orders
        await fetchOrders();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const addReview = async (vehicleId: number, reviewText: string, starRating: number) => {
    if (!currentUser) return false;
    try {
      const res = await fetch(`${API_URL}/user/createReview/${currentUser.id}/${vehicleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewText, starRating })
      });
      return res.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const getAverageRating = () => {
    // Note: To calculate global average rating we would either fetch from a specific endpoint
    // or rely on fetching reviews per vehicle. Since we are refactoring to backend,
    // global 'reviews' array isn't populated on load. We can just return 0 here and 
    // rely on VehicleDetailsModal's local fetch to get correct reviews.
    return 0;
  };

  return (
    <OrderContext.Provider value={{ orders, reviews, addOrder, addReview, getAverageRating }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}

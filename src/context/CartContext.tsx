import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';

import type { FrontendVehicle, CustomPart, ShippingAddress } from '../types';

export interface CartItem extends FrontendVehicle {
  cartItemId?: number; // from the backend CustomizedVehicle ID
  quantity: number;
  selectedParts: CustomPart[];
}

export interface CompletedOrder {
  items: CartItem[];
  vehiclesAndUpgradesPrice: number;
  totalPrice: number;
  shippingAddress: ShippingAddress | null;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (cartItemId: number) => void;
  updateQuantity: (cartItemId: number, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartCount: number;
  vehiclesAndUpgradesPrice: number;
  totalPrice: number;
  isCheckoutModalOpen: boolean;
  setIsCheckoutModalOpen: (open: boolean) => void;
  shippingAddress: ShippingAddress | null;
  setShippingAddress: (address: ShippingAddress | null) => void;
  lastOrder: CompletedOrder | null;
  setLastOrder: (order: CompletedOrder | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [lastOrder, setLastOrder] = useState<CompletedOrder | null>(null);

  const { currentUser, setIsAuthModalOpen } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchCart = async () => {
    if (!currentUser) {
      setCartItems([]);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/user/getCart/${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.customizedVehicle) {
          const items: CartItem[] = data.customizedVehicle.map((cv: any) => {
            const vModel = cv.vehicleInventory.vehicleModel;
            return {
              id: vModel.id,
              cartItemId: cv.id,
              vin: cv.vehicleInventory.vin,
              brand: vModel.brand,
              model: vModel.model,
              description: vModel.description,
              year: parseInt(vModel.year) || 2024,
              condition: cv.vehicleInventory.used ? 'used' : 'new',
              basePrice: vModel.discountedPrice || vModel.price,
              originalPrice: vModel.discountPercent > 0 ? vModel.price : undefined,
              rating: 0,
              image: vModel.vehicleimages?.find((img: any) => img.thumbnail)?.imageUrl || vModel.vehicleimages?.[0]?.imageUrl || '',
              km: cv.vehicleInventory.mileage || 0,
              horsePower: vModel.horsePower,
              availableParts: [],
              selectedParts: cv.vehicleCustomParts.map((p: any) => ({
                id: String(p.id),
                name: p.name,
                description: p.description,
                price: p.partPrice
              })),
              quantity: 1,
            };
          });
          setCartItems(items);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [currentUser]);

  const addToCart = async (vehicle: Omit<CartItem, 'quantity'>) => {
    if (!currentUser) {
      alert("Please log in to add items to your cart.");
      setIsAuthModalOpen(true);
      return;
    }

    const payload = {
      vehicleInventory: { vin: vehicle.vin },
      vehicleCustomParts: vehicle.selectedParts.map(p => ({ id: parseInt(p.id) }))
    };

    try {
      await fetch(`${API_URL}/user/addToCart/${currentUser.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      await fetchCart();
      setIsCartOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    if (!currentUser) return;
    try {
      await fetch(`${API_URL}/user/removeVehicleFromCart/${cartItemId}`, {
        method: 'DELETE'
      });
      await fetchCart();
    } catch (e) {
      console.error(e);
    }
  };

  const updateQuantity = (cartItemId: number, delta: number) => {
    // With physical inventory, quantity doesn't make much sense since each VIN is unique.
    // If delta < 0 and quantity becomes 0, we can remove it.
    const item = cartItems.find(i => i.cartItemId === cartItemId);
    if (item && item.quantity + delta <= 0) {
      removeFromCart(cartItemId);
    }
  };

  const clearCart = () => {
    // Not easily implemented for the backend unless we delete all items.
    // For now we'll just clear local state, though it will desync.
    // Ideally we would loop through and delete all.
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  const vehiclesAndUpgradesPrice = cartItems.reduce((total, item) => total + (item.basePrice * item.quantity) + item.selectedParts.reduce((acc, part) => acc + part.price, 0), 0);
  
  const totalPrice = vehiclesAndUpgradesPrice;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartCount,
        vehiclesAndUpgradesPrice,
        totalPrice,
        isCheckoutModalOpen,
        setIsCheckoutModalOpen,
        shippingAddress,
        setShippingAddress,
        lastOrder,
        setLastOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

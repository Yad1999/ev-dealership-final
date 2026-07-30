import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

import type { FrontendVehicle, CustomPart, ShippingAddress } from '../types';

export interface CartItem extends FrontendVehicle {
  quantity: number;
  selectedParts: CustomPart[];
}

export interface CompletedOrder {
  items: CartItem[];
  vehiclesAndUpgradesPrice: number;
  destinationFee: number;
  totalPrice: number;
  shippingAddress: ShippingAddress | null;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (vin: string) => void;
  updateQuantity: (vin: string, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartCount: number;
  vehiclesAndUpgradesPrice: number;
  destinationFee: number;
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

  const addToCart = (vehicle: Omit<CartItem, 'quantity'>) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.vin === vehicle.vin);
      if (existing) {
        return prev.map((item) =>
          item.vin === vehicle.vin ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...vehicle, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (vin: string) => {
    setCartItems((prev) => prev.filter((item) => item.vin !== vin));
  };

  const updateQuantity = (vin: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.vin === vin) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  const vehiclesAndUpgradesPrice = cartItems.reduce((sum, item) => {
    const partsTotal = item.selectedParts?.reduce((pSum, p) => pSum + p.price, 0) || 0;
    return sum + (item.basePrice + partsTotal) * item.quantity;
  }, 0);
  
  const destinationFee = cartCount > 0 ? 1500 : 0;
  const totalPrice = vehiclesAndUpgradesPrice + destinationFee;

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
        destinationFee,
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

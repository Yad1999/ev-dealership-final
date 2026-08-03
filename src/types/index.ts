export interface CustomPart {
  id: string; // part_id in schema
  name: string;
  description: string;
  price: number; // part_price in schema
}

export interface FrontendVehicle {
  id: number;
  vin: string; // unique identifier from vehicle_inventory
  brand: string; // from vehicle_model
  model: string; // from vehicle_model
  description: string; // from vehicle_model
  year: number; // from vehicle_model
  condition: 'new' | 'used'; // derived from is_used in vehicle_inventory
  basePrice: number; // price in vehicle_model
  originalPrice?: number; // if discounted
  rating: number; // from vehicle_reviews
  image: string; // from vehicle_image
  km: number; // mileage from vehicle_inventory
  horsePower: number; // horse_power from vehicle_model
  availableParts: CustomPart[]; // associated vehicle_custom_part
}

export interface User {
  id: string;
  username: string; // from users table
  email: string; // from users table
  password?: string;
  fname?: string;
  lname?: string;
  address?: ShippingAddress;
}

export interface ShippingAddress {
  street: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone: string;
}

export interface Review {
  id: string;
  userId: string;
  vehicleModel: string; // e.g., "Micro Bolt EV"
  rating: number;
  text: string;
  createdAt: string;
}

export interface OrderItem {
  vehicleModelId: number;
  vin: string;
  brand: string;
  model: string;
  year: number;
  image: string;
  basePrice: number;
  quantity: number;
  selectedParts: CustomPart[];
}

export interface Order {
  id: string;
  userId: string;
  datePlaced: string;
  totalAmount: number;
  status: 'Processing' | 'In Production' | 'In Transit' | 'Delivered';
  items: OrderItem[];
}

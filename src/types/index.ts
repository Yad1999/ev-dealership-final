export interface CustomPart {
  id: string; // part_id in schema
  name: string;
  description: string;
  price: number; // part_price in schema
}

export interface FrontendVehicle {
  vin: string; // unique identifier from vehicle_inventory
  brand: string; // from vehicle_model
  model: string; // from vehicle_model
  description: string; // from vehicle_model
  year: number; // from vehicle_model
  condition: 'new' | 'used'; // derived from is_used in vehicle_inventory
  basePrice: number; // price in vehicle_model
  originalPrice?: number; // if discounted
  range: number | string; // mapped for UI
  speed: number | string; // mapped for UI
  rating: number; // from vehicle_reviews
  image: string; // from vehicle_image
  km: number; // mileage from vehicle_inventory
  horsePower: number; // horse_power from vehicle_model
  availableParts: CustomPart[]; // associated vehicle_custom_part
}

export interface User {
  id: string;
  firstName: string; // type in order screen only
  lastName: string; // type in order screen only
  email: string;
  password?: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone: string;
}

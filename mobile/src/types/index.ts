export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  status: 'Readily Available' | 'Preorder';
  description?: string;
  image_url?: string;
  gallery_urls?: string[];
  mileage?: number;
  vin?: string;
  transmission?: 'Automatic' | 'Manual' | 'Semi-Auto';
  fuel_type?: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';
  interior_color?: string;
  exterior_color?: string;
  engine?: string;
  stock_number?: string;
  vendor_id?: string;
  approval_status?: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  role: 'customer' | 'admin' | 'vendor';
  vendor_status: 'none' | 'pending' | 'approved' | 'rejected';
  vendor_type: 'car' | 'parts' | 'both';
  preorder_status: 'none' | 'pending' | 'approved' | 'rejected';
  status: 'active' | 'suspended' | 'banned' | 'disabled';
  business_name?: string;
  business_details?: any;
  phone?: string;
  address?: string;
  store_video_url?: string;
  store_image_url?: string;
  created_at: string;
}

export interface Order {
  id: string;
  user_id?: string;
  car_id?: string;
  amount: number;
  status: 'Pending' | 'Paid' | 'Processing' | 'Shipped' | 'Delivered';
  payment_ref?: string;
  created_at: string;
}

export interface Inquiry {
  id: string;
  car_id?: string;
  car_name?: string;
  name: string;
  email: string;
  phone?: string;
  type: 'Inspection' | 'Purchase';
  message?: string;
  status: 'New' | 'Contacted' | 'Archived';
  created_at: string;
}

export interface Preorder {
  id: string;
  name: string;
  email: string;
  phone?: string;
  make: string;
  model: string;
  year?: number;
  budget?: number;
  message?: string;
  status: 'Searching' | 'Sourced' | 'Delivered';
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  car_id: string;
  quantity: number;
  created_at: string;
}

export interface SparePart {
  id: string;
  vendor_id: string;
  name: string;
  category: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  price: number;
  image_url?: string;
  description?: string;
  condition: 'New' | 'Used' | 'Refurbished';
  stock_quantity: number;
  status: 'active' | 'out_of_stock' | 'discontinued';
  created_at: string;
}

export interface SparePartOrder {
  id: string;
  user_id: string;
  part_id?: string; // Optional if linked to inventory
  part_name: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: string;
  quantity: number;
  description?: string;
  status: 'Pending' | 'Sourced' | 'Shipped' | 'Delivered';
  created_at: string;
}

export interface TowRequest {
  id: string;
  user_id: string;
  pickup_address: string;
  destination_address: string;
  vehicle_type: string;
  notes?: string;
  status: 'Searching' | 'En Route' | 'Completed' | 'Cancelled';
  created_at: string;
}

export interface Mechanic {
  id: string;
  name: string;
  specialty: string;
  location: string;
  rating: number;
  is_approved: boolean; // Transhub Approved
  phone?: string;
  image_url?: string;
  created_at: string;
}

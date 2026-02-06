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
  role: 'customer' | 'admin' | 'vendor';
  vendor_status: 'none' | 'pending' | 'approved' | 'rejected';
  preorder_status: 'none' | 'pending' | 'approved' | 'rejected';
  status: 'active' | 'suspended' | 'banned' | 'disabled';
  business_name?: string;
  business_details?: any;
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

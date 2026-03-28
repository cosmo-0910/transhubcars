-- Create mechanic_bookings table
CREATE TABLE IF NOT EXISTS public.mechanic_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    vehicle_info TEXT NOT NULL,
    service_type TEXT NOT NULL,
    description TEXT,
    appointment_mode TEXT NOT NULL, -- 'pickup' or 'drop-off'
    appointment_date TEXT NOT NULL,
    appointment_time TEXT NOT NULL,
    location TEXT,
    email TEXT NOT NULL,
    phone1 TEXT NOT NULL,
    phone2 TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.mechanic_bookings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own bookings" 
ON public.mechanic_bookings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookings" 
ON public.mechanic_bookings FOR INSERT 
WITH CHECK (true); -- Allow anonymous or logged in users to book

-- Admin policy (assuming admin has a specific role or metadata)
-- For now, let's allow all authenticated users to see all if they are 'admin' in profiles
CREATE POLICY "Admins can view all bookings" 
ON public.mechanic_bookings FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

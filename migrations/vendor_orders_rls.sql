-- Add RLS policies for vendors to see orders for their own cars
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow vendors to see orders where the car belongs to them
DROP POLICY IF EXISTS "Vendors View Own Car Orders" ON orders;
CREATE POLICY "Vendors View Own Car Orders" ON orders 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM cars 
    WHERE cars.id = orders.car_id 
    AND cars.vendor_id = auth.uid()
  )
);

-- Allow vendors to update order status for their own cars
DROP POLICY IF EXISTS "Vendors Update Own Car Order Status" ON orders;
CREATE POLICY "Vendors Update Own Car Order Status" ON orders 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM cars 
    WHERE cars.id = orders.car_id 
    AND cars.vendor_id = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM cars 
    WHERE cars.id = orders.car_id 
    AND cars.vendor_id = auth.uid()
  )
);

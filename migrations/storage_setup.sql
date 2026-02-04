-- Create a bucket for car images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('car-images', 'car-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'car-images');

-- Allow authenticated vendors to upload images
CREATE POLICY "Vendors Can Upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'car-images' AND
  auth.role() = 'authenticated'
);

-- Allow vendors to update/delete their own uploads
CREATE POLICY "Vendors Can Manage Own Uploads" ON storage.objects FOR ALL USING (
  bucket_id = 'car-images' AND
  auth.uid() = owner
);

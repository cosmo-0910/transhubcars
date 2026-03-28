-- Migration: vendor_reviews
-- Description: Creates a table for direct user reviews and ratings for vendors.

CREATE TABLE IF NOT EXISTS vendor_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(vendor_id, user_id) -- One review per user per vendor
);

-- Enable RLS
ALTER TABLE vendor_reviews ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Reviews are viewable by everyone" 
ON vendor_reviews FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" 
ON vendor_reviews FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can edit their own reviews" 
ON vendor_reviews FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
ON vendor_reviews FOR DELETE 
USING (auth.uid() = user_id);

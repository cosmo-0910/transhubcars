-- Initialize Comprehensive Platform Settings
-- This seeds the platform_settings table with the JSON structure required for the Architect's Command Center.

INSERT INTO platform_settings (key, value, updated_at)
VALUES 
(
  'branding', 
  '{
    "name": "Transhub Luxury Automotive",
    "tagline": "The Pinnacle of Nigerian Automotive Excellence",
    "primary_color": "#c5a059",
    "secondary_color": "#121212",
    "logo_url": "/assets/logo-gold.png",
    "favicon_url": "/favicon.ico"
  }'::jsonb,
  now()
),
(
  'support', 
  '{
    "email": "concierge@transhub.ng",
    "phone": "+234 810 TRANSHUB",
    "whatsapp": "+234 810 000 0000",
    "address": "Victoria Island, Lagos, Nigeria",
    "coordinates": {"lat": 6.4281, "lng": 3.4219}
  }'::jsonb,
  now()
),
(
  'operations', 
  '{
    "maintenance_mode": false,
    "ai_intelligence": true,
    "towing_service_enabled": true,
    "audit_level": "High",
    "max_image_size_mb": 5
  }'::jsonb,
  now()
),
(
  'finance', 
  '{
    "towing_base_fee": 25000,
    "towing_cost_per_km": 500,
    "car_listing_commission_pct": 2.5,
    "parts_sale_commission_pct": 10.0,
    "currency": "NGN"
  }'::jsonb,
  now()
),
(
  'legal', 
  '{
    "terms_url": "/legal/terms",
    "privacy_url": "/legal/privacy",
    "vendor_agreement_url": "/legal/vendor-agreement",
    "refund_policy": "Standard 48-hour window for parts."
  }'::jsonb,
  now()
),
(
  'security',
  '{
    "enforce_2fa": true,
    "telemetry_enabled": true,
    "session_timeout": 120,
    "audit_persistence_days": 90
  }'::jsonb,
  now()
)
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value, updated_at = now();

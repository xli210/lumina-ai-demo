-- ============================================
-- UPDATE max_activations default to 1
-- Run this if you already have the licenses table created with default 2
-- ============================================

-- Change the column default to 1
ALTER TABLE public.licenses ALTER COLUMN max_activations SET DEFAULT 1;

-- Update any existing licenses that still have max_activations = 2
UPDATE public.licenses SET max_activations = 1 WHERE max_activations = 2;

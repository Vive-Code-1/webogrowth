
-- Add new columns to projects table
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS budget numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'BDT',
  ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS category text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS notes text DEFAULT NULL;

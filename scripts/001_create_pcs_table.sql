-- Create PCs table to store remote PC information
CREATE TABLE IF NOT EXISTS public.pcs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ip_address INET NOT NULL,
  port INTEGER NOT NULL DEFAULT 8080,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pcs_name ON public.pcs(name);
CREATE INDEX IF NOT EXISTS idx_pcs_ip_port ON public.pcs(ip_address, port);

-- Enable Row Level Security
ALTER TABLE public.pcs ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations (we can add user-specific policies later if auth is needed)
CREATE POLICY "Allow all operations on pcs" ON public.pcs
  FOR ALL USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pcs_updated_at 
    BEFORE UPDATE ON public.pcs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

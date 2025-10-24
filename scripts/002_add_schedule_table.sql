-- Create schedules table to store PC schedule configurations
CREATE TABLE IF NOT EXISTS public.pc_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pc_id UUID NOT NULL REFERENCES public.pcs(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  start_time TIME NOT NULL DEFAULT '22:00',
  end_time TIME NOT NULL DEFAULT '07:00',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(pc_id)
);

-- Enable Row Level Security
ALTER TABLE public.pc_schedules ENABLE ROW LEVEL SECURITY;

-- Allow all operations (we can add user-specific policies later if auth is needed)
CREATE POLICY "Allow all operations on pc_schedules" ON public.pc_schedules
  FOR ALL USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE TRIGGER update_pc_schedules_updated_at 
    BEFORE UPDATE ON public.pc_schedules 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pc_schedules_pc_id ON public.pc_schedules(pc_id);

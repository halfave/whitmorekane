import { createClient } from '@supabase/supabase-js';

// Browser client. Only used to upload files to one-time signed URLs.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

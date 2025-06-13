import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqzxzvympscqvssyndvk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxenh6dnltcHNjcXZzc3luZHZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NDkzNjEsImV4cCI6MjA2NTIyNTM2MX0.--YEIkgCm6yiKIEWNpLIJKzCtwpy_elpRqkZCBWDMpU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
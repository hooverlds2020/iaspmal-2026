// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rvpovifwugksrsmgabcj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cG92aWZ3dWdrc3JzbWdhYmNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODUwODYsImV4cCI6MjA3NTM2MTA4Nn0.Qyqsj8uoMinKkx5DrmiFaZpEJtzz3ZH_HnciDZNv1r0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

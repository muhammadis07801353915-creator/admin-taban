import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kdlwstunxgbwxwafhvkm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbHdzdHVueGdid3h3YWZodmttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMjc4MjgsImV4cCI6MjA5MjgwMzgyOH0.bI3uXegL9aHqQh3OFxqHYBHR_NOSYg1zaJOa_8mBs3k';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getTables() {
  const { data, error } = await supabase.rpc('get_tables_info');
  console.log(data || error);
}

getTables();

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('cars').select('*').limit(1);
  if (error) {
    console.error('Error fetching cars:', error);
  } else if (data && data.length > 0) {
    console.log('Columns in cars table:', Object.keys(data[0]));
  } else {
    console.log('Cars table is empty, creating a dummy check or getting structure from another source');
    // Attempt to query using postgres if possible, or we can just run a select on an empty table to see keys returned? No, empty array won't have objects.
    // Let's do an RPC or show schema if we can
  }
}
check();

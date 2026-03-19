
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing env variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function diagnose() {
  console.log('--- Database Diagnosis ---');
  console.log('URL:', supabaseUrl);
  
  // 1. Test connection and list tables
  const { data: tables, error: tableError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (tableError) {
    console.error('Error fetching from profiles:', tableError);
  } else {
    console.log('Successfully connected to profiles table.');
    if (tables.length > 0) {
      console.log('Columns found in first row:', Object.keys(tables[0]));
    } else {
      console.log('Profiles table is empty.');
    }
  }

  // 2. Check for other tables
  const { data: allTables, error: schemaError } = await supabase
    .rpc('get_tables'); // This might not exist, but worth a try

  if (schemaError) {
    console.log('RPC get_tables not available.');
  } else {
    console.log('Tables:', allTables);
  }
}

diagnose();

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://yyqanymzdenvwrinpgel.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5cWFueW16ZGVudndyaW5wZ2VsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ5Mzg4OSwiZXhwIjoyMDg5MDY5ODg5fQ.C7GCT2z6-cSlVJEx9gralnSYq_6HI8SI7Jeq2_pZo08';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
  console.log('--- FINDING GAUTHAM NAIR ---');
  const { data: gauthams, error: gErr } = await supabase.from('profiles').select('*').ilike('name', '%Gautham%');
  if (gErr) console.error(gErr);
  else console.log(gauthams);
}

debug();

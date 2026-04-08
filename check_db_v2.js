const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const getValue = (key) => {
  const match = env.match(new RegExp(`${key}=(.*)`));
  return match ? match[1].trim() : null;
};

const supabaseUrl = getValue('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getValue('SUPABASE_SERVICE_ROLE_KEY') || getValue('NEXT_PUBLIC_SUPABASE_ANON_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .limit(1);

  if (error) {
    console.error("Error fetching transactions:", error);
    return;
  }

  if (data && data.length > 0) {
    console.log("Columns in transactions:", Object.keys(data[0]));
  } else {
    console.log("Table transactions is empty.");
  }
}

check();

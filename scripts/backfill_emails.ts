import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function backfillEmails() {
  console.log('--- Starting Profile Email Backfill ---');

  // 1. Get all users from Auth
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error('Error fetching auth users:', authError);
    return;
  }

  console.log(`Found ${users.length} users in Auth.`);

  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const user of users) {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ email: user.email })
      .eq('id', user.id);

    if (updateError) {
      console.error(`Error updating profile ${user.id}:`, updateError.message);
      errorCount++;
    } else {
      updatedCount++;
    }
  }

  console.log('--- Backfill Complete ---');
  console.log(`Total Auth Users: ${users.length}`);
  console.log(`Updated Profiles: ${updatedCount}`);
  console.log(`Errors: ${errorCount}`);
}

backfillEmails().catch(err => console.error('Unhandled error:', err));

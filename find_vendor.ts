
import { supabase } from './shared/lib/supabase.js';

async function findVendor() {
  const { data: cars, error } = await supabase
    .from('cars')
    .select('vendor_id, make, model')
    .not('vendor_id', 'is', null)
    .limit(1);

  if (error) {
    console.error('Error fetching car:', error);
    return;
  }

  if (cars.length > 0) {
    console.log('Found car with vendor:', cars[0]);
  } else {
    console.log('No cars found with vendor_id');
  }
}

findVendor();

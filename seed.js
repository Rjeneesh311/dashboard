/* global process */
import { createClient } from '@supabase/supabase-js';
import { MOCK_DATA } from './src/data/mockData.js';

// Setup admin client bypassing RLS policies
const supabaseUrl = 'https://rwdshqfdkfluhmgymvmv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3ZHNocWZka2ZsdWhtZ3ltdm12Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDkyMTAyMCwiZXhwIjoyMDkwNDk3MDIwfQ.tC0oY4tZKmssM9_uSDu0moR2kKQ4hk6rlh6HShm2i1c';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function seed() {
  console.log('Connecting to Supabase (via REST API w/ Service Role)...');

  try {
      // 1. Check if materials exist to avoid duplicates if seeded
      let { data: existingMats, error: matErr } = await supabaseAdmin.from('materials').select('code').limit(1);
      if (matErr) throw matErr;
      
      if (existingMats && existingMats.length > 0) {
          console.log('Database already seeded! Continuing to application dev.');
      } else {
          console.log(`Seeding ${MOCK_DATA.materials.length} Master Materials...`);
          const materialsToInsert = MOCK_DATA.materials.map(m => ({
              code: m.id,
              name: m.name,
              category: m.cat,
              unit: m.unit,
              req_qty: m.reqQty,
              proc_qty: m.procQty,
              market_rate: m.rate,
              status: m.status
          }));
          const { error: insertMatErr } = await supabaseAdmin.from('materials').insert(materialsToInsert);
          if (insertMatErr) console.error("Error inserting materials", insertMatErr);
          else console.log("✓ Materials Seeded Successfully.");

          console.log(`Seeding ${MOCK_DATA.vendors.length} Vendors...`);
          const vendorsToInsert = MOCK_DATA.vendors.map(v => ({
             name: v.name,
             gst_number: v.gst,
             location: v.loc,
             contact_person: v.contact,
             phone: v.phone,
             email: v.email,
             quality_score: v.score 
          }));
          const { error: insertVenErr } = await supabaseAdmin.from('vendors').insert(vendorsToInsert);
          if (insertVenErr) console.error("Error inserting vendors", insertVenErr);
          else console.log("✓ Vendors Seeded Successfully.");
          
          console.log(`Fetching seeded data to link Purchase Orders...`);
          const { data: dbMats } = await supabaseAdmin.from('materials').select('id, code, name');
          const { data: dbVends } = await supabaseAdmin.from('vendors').select('id, gst_number, name');
          
          if (dbMats && dbVends) {
              const posToInsert = [];
              // We need admin or procurement user profile for "created_by", but for seeder, we can leave it null if schema allows,
              // Looking at schema, created_by UUID REFERENCES public.profiles(id). Null is fine unless NOT NULL is set. (It is not).
              
              for (const po of MOCK_DATA.pos) {
                  // Find material UUID
                  const mId = dbMats.find(m => m.name === po.material)?.id;
                  const vId = dbVends.find(v => v.name === po.vendor)?.id;
                  
                  if (mId && vId) {
                      posToInsert.push({
                          po_number: po.id,
                          vendor_id: vId,
                          material_id: mId,
                          ordered_qty: po.qty,
                          agreed_rate: po.rate,
                          status: po.status
                      });
                  }
              }
              console.log(`Seeding ${posToInsert.length} Purchase Orders...`);
              const { error: insertPoErr } = await supabaseAdmin.from('purchase_orders').insert(posToInsert);
              if (insertPoErr) console.error("Error inserting POs", insertPoErr);
              else console.log("✓ Purchase Orders Seeded Successfully.");
          }
      }

      console.log('--- Seeding Routine Finished! Dashboard is live on DB ---');
      process.exit(0);
  } catch (err) {
      console.error("Critical Seed Error:", err);
      process.exit(1);
  }
}

seed();

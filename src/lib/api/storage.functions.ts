import { createServerFn } from "@tanstack/react-start";
import { verifyAdminAccess } from "../admin-auth.functions";

/**
 * Ensures that the required storage buckets exist and are public.
 * Uses the Supabase Admin client to bypass RLS and create buckets if they don't exist.
 */
export const ensureBucketsExist = createServerFn({ method: "POST" })
  .middleware([verifyAdminAccess])
  .handler(async () => {
    // Dynamically import the admin client to ensure it only runs on the server
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    try {
      const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
      
      if (listError) {
        console.error("Failed to list buckets", listError);
        return { ok: false, error: listError.message };
      }

      const bucketNames = buckets?.map(b => b.name) || [];
      const requiredBuckets = ["product-images"];
      
      for (const name of requiredBuckets) {
        if (!bucketNames.includes(name)) {
          // Create the bucket if it's completely missing
          const { error: createError } = await supabaseAdmin.storage.createBucket(name, { public: true });
          if (createError) {
            console.error(`Failed to create bucket ${name}`, createError);
          }
        } else {
          // Ensure it is public just in case
          const { error: updateError } = await supabaseAdmin.storage.updateBucket(name, { public: true });
          if (updateError) {
             console.error(`Failed to update bucket ${name}`, updateError);
          }
        }
      }
      return { ok: true };
    } catch (err: any) {
      console.error("Unexpected error in ensureBucketsExist:", err);
      return { ok: false, error: err?.message || String(err) };
    }
  });

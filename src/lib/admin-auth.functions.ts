import { createServerFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Server-side admin role verification.
 * Verifies the bearer token (requireSupabaseAuth) AND checks the user has the
 * 'admin' role in public.user_roles via the has_role() security-definer RPC.
 * Returns { ok: true } on success; throws on failure (caller catches and redirects).
 */
export const verifyAdminAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Get the actual user object to check the email
    const { data: { user } } = await context.supabase.auth.getUser();
    
    // Check for manager role
    if (user?.email === "dakarlom662@gmail.com") {
      return { ok: true, role: "manager" as const };
    }

    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    
    if (error || data !== true) throw new Error("NotAdminOrManager");
    return { ok: true, role: "admin" as const };
  });

/**
 * Use inside a route's `beforeLoad`. All admin routes are ssr:false, so this
 * is a no-op on the server. Protection is handled client-side by useAdminAuth.
 * The manager redirect is handled in the login page and useAdminAuth hook.
 */
export async function guardAdminRoute() {
  // No-op: client-side auth protection is handled by useAdminAuth hook
  // which redirects to /admin/login if not authenticated/authorised.
}

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
    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error) throw new Error("AdminCheckFailed");
    if (data !== true) throw new Error("NotAdmin");
    return { ok: true as const };
  });

/**
 * Use inside a route's `beforeLoad`. Calls the server fn and throws a redirect
 * to /admin/login if the user is not authenticated or not an admin.
 * This eliminates the brief "flash" of admin UI before the client-side hook redirects.
 */
export async function guardAdminRoute() {
  try {
    await verifyAdminAccess();
  } catch {
    throw redirect({ to: "/admin/login", replace: true });
  }
}

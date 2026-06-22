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
    // Check for manager role hardcoded using claims from the JWT
    if (context.claims?.email === "dakarlom662@gmail.com") {
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
 * Use inside a route's `beforeLoad`. Calls the server fn and throws a redirect
 * to /admin/login if the user is not authenticated or not an admin.
 * This eliminates the brief "flash" of admin UI before the client-side hook redirects.
 */
export async function guardAdminRoute({ location }: { location: { pathname: string } }) {
  try {
    const res = await verifyAdminAccess();
    if (res.role === "manager" && !location.pathname.startsWith("/admin/devis")) {
      throw redirect({ to: "/admin/devis", replace: true });
    }
  } catch (err) {
    if (err && typeof err === "object" && "isRedirect" in err) {
      throw err;
    }
    throw redirect({ to: "/admin/login", replace: true });
  }
}

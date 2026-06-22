import { useEffect, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const MANAGER_EMAIL = "dakarlom662@gmail.com";

type State = { status: "loading" | "ok" | "denied"; email?: string; role?: "admin" | "manager" };

export function useAdminAuth() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let mounted = true;

    async function check() {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (!mounted) return;
      if (userErr || !userData.user) {
        navigate({ to: "/admin/login", replace: true });
        return;
      }
      
      if (userData.user.email === MANAGER_EMAIL) {
        // Manager can only access /admin/devis — redirect if elsewhere
        if (!pathname.startsWith("/admin/devis")) {
          navigate({ to: "/admin/devis", replace: true });
          return;
        }
        setState({ status: "ok", email: userData.user.email, role: "manager" });
        return;
      }

      const { data: roleData, error: roleErr } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!mounted) return;
      if (roleErr || !roleData) {
        setState({ status: "denied", email: userData.user.email ?? "" });
        return;
      }
      setState({ status: "ok", email: userData.user.email ?? "", role: "admin" });
    }

    check();

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        navigate({ to: "/admin/login", replace: true });
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  return state;
}

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_EMAIL = "isaiahmaximowork@gmail.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: "Não autenticado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller is admin
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ success: false, error: "Sessão inválida" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (userData.user.email !== ADMIN_EMAIL) {
      return new Response(JSON.stringify({ success: false, error: "Acesso negado" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const input = await req.json();
    const { action } = input;

    if (action === "create") {
      const { email, password, name } = input;
      if (!email || !password) {
        return new Response(JSON.stringify({ success: false, error: "Email e senha obrigatórios" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: name || "" },
      });

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, user: { id: data.user.id, email: data.user.email } }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete") {
      const { userId } = input;
      if (!userId) {
        return new Response(JSON.stringify({ success: false, error: "userId obrigatório" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Don't allow deleting admin
      const { data: targetUser } = await admin.auth.admin.getUserById(userId);
      if (targetUser?.user?.email === ADMIN_EMAIL) {
        return new Response(JSON.stringify({ success: false, error: "Não é possível deletar a conta admin" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await admin.auth.admin.deleteUser(userId);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "list") {
      const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (error) throw error;

      const users = data.users.map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
      }));

      return new Response(JSON.stringify({ success: true, users }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: false, error: "Ação inválida" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("admin-manage-users error:", err);
    return new Response(JSON.stringify({ success: false, error: err instanceof Error ? err.message : "Erro" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json(401, { error: "Not authenticated. Please sign in again." });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await callerClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return json(401, { error: "Invalid session. Please sign in again." });
    }
    const callerId = claimsData.claims.sub as string;

    const adminClient = createClient(supabaseUrl, serviceKey);

    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleData) return json(403, { error: "Only admins can invite users." });

    let body: any;
    try {
      body = await req.json();
    } catch {
      return json(400, { error: "Invalid JSON body." });
    }

    const email = (body?.email ?? "").toString().trim().toLowerCase();
    const role = (body?.role ?? "").toString();
    const full_name = (body?.full_name ?? "").toString().trim() || email;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json(400, { error: "Please enter a valid email address." });
    }
    if (!["admin", "team", "client"].includes(role)) {
      return json(400, { error: "Invalid role. Must be admin, team, or client." });
    }

    // Find existing user (if any) by listing users — match by email
    let existingUserId: string | null = null;
    {
      const { data: list, error: listErr } = await adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 200,
      });
      if (!listErr && list?.users) {
        const found = list.users.find(
          (u) => (u.email ?? "").toLowerCase() === email,
        );
        if (found) existingUserId = found.id;
      }
    }

    let userId: string;
    let invitedNow = false;

    if (existingUserId) {
      userId = existingUserId;
    } else {
      const { data: inviteData, error: inviteError } =
        await adminClient.auth.admin.inviteUserByEmail(email, {
          data: { full_name },
          redirectTo: "https://webogrowth.lovable.app",
        });
      if (inviteError || !inviteData?.user) {
        const msg = inviteError?.message || "Failed to send invitation email.";
        const isRate = /rate|limit/i.test(msg);
        return json(isRate ? 429 : 400, {
          error: isRate
            ? "Email rate limit reached. Please try again in a few minutes."
            : msg,
        });
      }
      userId = inviteData.user.id;
      invitedNow = true;
    }

    // Ensure profile row exists / is up to date
    await adminClient
      .from("profiles")
      .upsert(
        { id: userId, email, full_name },
        { onConflict: "id" },
      );

    // Assign role (idempotent)
    const { error: roleInsertError } = await adminClient
      .from("user_roles")
      .upsert({ user_id: userId, role }, { onConflict: "user_id,role" });

    if (roleInsertError) {
      return json(500, { error: `Could not assign role: ${roleInsertError.message}` });
    }

    return json(200, {
      success: true,
      user_id: userId,
      invited: invitedNow,
      message: invitedNow
        ? "Invitation email sent and role assigned."
        : "User already existed — role updated.",
    });
  } catch (err: any) {
    return json(500, { error: err?.message ?? "Unexpected error." });
  }
});

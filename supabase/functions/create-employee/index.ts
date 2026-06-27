import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create admin client (service role — full access)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Extract JWT from Authorization header
    const authHeader = req.headers.get("Authorization");
    const jwt = authHeader?.replace("Bearer ", "");

    if (!jwt) {
      return jsonResponse({ error: "Missing authorization token" }, 401);
    }

    // Verify the requesting user using admin client + JWT
    const {
      data: { user: requestingUser },
      error: authError,
    } = await supabaseAdmin.auth.getUser(jwt);

    if (authError || !requestingUser) {
      return jsonResponse(
        { error: "Invalid or expired token" },
        401
      );
    }

    // Check if requesting user is a super_admin
    const { data: requestingProfile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", requestingUser.id)
      .single();

    if (!requestingProfile || requestingProfile.role !== "super_admin") {
      return jsonResponse(
        { error: "Only super admins can create employees" },
        403
      );
    }

    // Parse request body
    const { full_name, email, role, password } = await req.json();

    // Validate required fields
    if (!full_name || !email || !role || !password) {
      return jsonResponse(
        { error: "Missing required fields: full_name, email, role, password" },
        400
      );
    }

    // Validate role
    const validRoles = ["super_admin", "store_manager", "supervisor", "worker"];
    if (!validRoles.includes(role)) {
      return jsonResponse(
        { error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
        400
      );
    }

    // Generate next employee code
    const { data: existingProfiles } = await supabaseAdmin
      .from("profiles")
      .select("employee_code")
      .order("employee_code", { ascending: false })
      .limit(1);

    let nextCodeNum = 1;
    if (existingProfiles && existingProfiles.length > 0) {
      const lastCode = existingProfiles[0].employee_code;
      const num = parseInt(lastCode.replace("EMP", ""), 10);
      if (!isNaN(num)) {
        nextCodeNum = num + 1;
      }
    }
    const employeeCode = `EMP${String(nextCodeNum).padStart(3, "0")}`;

    // Step 1: Create the auth user
    const { data: authData, error: createAuthError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name,
          role,
          employee_code: employeeCode,
        },
      });

    if (createAuthError) {
      return jsonResponse({ error: createAuthError.message }, 400);
    }

    const newUserId = authData.user.id;

    // Step 2: Insert the profile row
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: newUserId,
        employee_code: employeeCode,
        email,
        full_name,
        role,
        is_active: true,
      })
      .select()
      .single();

    if (profileError) {
      // Cleanup: delete the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return jsonResponse(
        { error: `Profile creation failed: ${profileError.message}` },
        500
      );
    }

    return jsonResponse({
      success: true,
      employee: profile,
      message: `Employee ${employeeCode} created successfully`,
    });
  } catch (err: any) {
    return jsonResponse(
      { error: err.message || "Internal server error" },
      500
    );
  }
});

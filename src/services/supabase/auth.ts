import { supabase } from "./client";
import { logAction } from "./audit";

export async function loginWithEmployeeCode(
  employeeCode: string,
  password: string
) {
  const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("email")
  .eq("employee_code", employeeCode.toUpperCase())
  .single();

console.log("PROFILE:", profile);
console.log("PROFILE ERROR:", profileError);

  if (profileError || !profile) {
    throw new Error("Employee not found");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password,
  });

  if (error) {
    throw error;
  }

  await logAction({
    action: "LOGIN",
    entity_type: "AUTH",
    entity_id: data.user.id,
    details: { employee_code: employeeCode.toUpperCase() },
  });

  return data;
}

export async function logout() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    await logAction({
      action: "LOGOUT",
      entity_type: "AUTH",
      entity_id: user.id,
    });
  }

  await supabase.auth.signOut();
}

export async function getCurrentProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Profile Error:", error);
    return null;
  }

  return data;
}
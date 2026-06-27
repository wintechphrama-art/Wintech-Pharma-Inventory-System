import { useEffect, useState } from "react";

import { supabase } from "@/services/supabase/client";
import { getCurrentProfile } from "@/services/supabase/auth";

import type { UserProfile } from "@/types/auth";

export function useAuth() {
  const [user, setUser] = useState<any>(null);

  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);

    if (user) {
      const profileData =
        await getCurrentProfile();

      setProfile(profileData);
    } else {
      setProfile(null);
    }

    setLoading(false);
  }

  return {
    user,
    profile,
    loading,
  };
}
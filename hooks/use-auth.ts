"use client";

import { useState, useEffect } from "react";
import { authService, type AuthUser } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const user = await authService.getUser();
        setUser(user);
      } catch (error) {
        // Silent fail - user will be null
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data } = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });
    
    // Make sure subscription exists before trying to unsubscribe
    return () => {
      if (data && data.subscription) {
        data.subscription.unsubscribe();
      }
    };
  }, []);

  return {
    user,
    loading,
    signIn: authService.signIn,
    signUp: authService.signUp,
    signOut: authService.signOut,
  };
}

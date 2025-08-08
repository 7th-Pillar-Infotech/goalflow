import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";

export interface AuthUser extends User {
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
    role: string;
  };
}

export const authService = {
  async signUp(email: string, password: string, fullName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    // Create profile after signup
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        email: data.user.email!,
        full_name: fullName || null,
      });

      if (profileError) throw profileError;
    }

    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  async getUser(): Promise<AuthUser | null> {
    // Check if supabase client is initialized
    if (!supabase) {
      return null;
    }

    // Check if auth is available on supabase
    if (!supabase.auth) {
      return null;
    }

    // Check if getUser method exists
    if (typeof supabase.auth.getUser !== "function") {
      return null;
    }

    try {
      // Use a timeout to prevent hanging
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(
          () =>
            reject(
              new Error("Supabase auth.getUser timed out after 5 seconds")
            ),
          5000
        );
      });

      // Race between the actual API call and the timeout
      let response;
      try {
        response = (await Promise.race([
          supabase.auth.getUser(),
          timeoutPromise,
        ])) as any;
      } catch (apiError) {
        return null;
      }

      // Check if response exists
      if (!response) {
        return null;
      }

      // Now safely extract the user and error
      const data = response.data;
      const error = response.error;

      if (error) {
        return null;
      }

      if (!data) {
        return null;
      }

      const user = data.user;

      if (!user) {
        return null;
      }

      return user;
    } catch (error) {
      return null;
    }
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          const user = await this.getUser();
          callback(user);
        } else {
          callback(null);
        }
      } catch (error) {
        callback(null);
      }
    });

    return { data };
  },
};

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          type: "individual" | "team";
          status: "not_started" | "in_progress" | "at_risk" | "completed";
          progress: number;
          target_date: string | null;
          tags: string[] | null;
          owner_id: string;
          team_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          type: "individual" | "team";
          status?: "not_started" | "in_progress" | "at_risk" | "completed";
          progress?: number;
          target_date?: string | null;
          tags?: string[] | null;
          owner_id: string;
          team_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          type?: "individual" | "team";
          status?: "not_started" | "in_progress" | "at_risk" | "completed";
          progress?: number;
          target_date?: string | null;
          tags?: string[] | null;
          owner_id?: string;
          team_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          subgoal_id: string;
          title: string;
          description: string | null;
          status: "not_started" | "in_progress" | "blocked" | "completed";
          priority: "low" | "medium" | "high";
          due_date: string | null;
          assigned_to: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};

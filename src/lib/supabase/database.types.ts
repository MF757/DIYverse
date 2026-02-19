/**
 * DIYverse database types (standard structures only).
 * Regenerate from project: npm run db:types (with SUPABASE_PROJECT_ID).
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = 'user' | 'moderator' | 'admin';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          auth_user_id: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          role: AppRole;
          created_at: string;
          updated_at: string;
          display_name_changed_at: string | null;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: AppRole;
          created_at?: string;
          updated_at?: string;
          display_name_changed_at?: string | null;
        };
        Update: {
          id?: string;
          auth_user_id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: AppRole;
          created_at?: string;
          updated_at?: string;
          display_name_changed_at?: string | null;
        };
      };
      projects: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          slug: string;
          description: string | null;
          cover_url: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          slug: string;
          description?: string | null;
          cover_url?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          cover_url?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      projects_public_with_owner: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          slug: string;
          description: string | null;
          cover_url: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
          owner_display_name: string | null;
          owner_avatar_url: string | null;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: {
      app_role: AppRole;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Insertable<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type Updatable<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

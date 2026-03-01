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

export type ProjectFileType = 'stl' | '3mf' | 'gerber' | 'pdf' | 'other';

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
          meta_description: string | null;
          seo_title: string | null;
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
          meta_description?: string | null;
          seo_title?: string | null;
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
          meta_description?: string | null;
          seo_title?: string | null;
        };
      };
      project_components: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          quantity: string;
          link: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          quantity?: string;
          link?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          quantity?: string;
          link?: string | null;
          sort_order?: number;
          created_at?: string;
        };
      };
      project_instruction_steps: {
        Row: {
          id: string;
          project_id: string;
          sort_order: number;
          description: string;
          image_path: string | null;
          tools: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          sort_order?: number;
          description: string;
          image_path?: string | null;
          tools?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          sort_order?: number;
          description?: string;
          image_path?: string | null;
          tools?: string[];
          created_at?: string;
        };
      };
      project_instruction_step_components: {
        Row: {
          step_id: string;
          component_id: string;
        };
        Insert: {
          step_id: string;
          component_id: string;
        };
        Update: {
          step_id?: string;
          component_id?: string;
        };
      };
      project_files: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          storage_path: string;
          file_type: ProjectFileType;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          storage_path: string;
          file_type?: ProjectFileType;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          storage_path?: string;
          file_type?: ProjectFileType;
          created_at?: string;
        };
      };
      project_images: {
        Row: {
          id: string;
          project_id: string;
          sort_order: number;
          storage_path: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          sort_order?: number;
          storage_path: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          sort_order?: number;
          storage_path?: string;
          created_at?: string;
        };
      };
      project_comments: {
        Row: {
          id: string;
          project_id: string;
          profile_id: string;
          parent_id: string | null;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          profile_id: string;
          parent_id?: string | null;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          profile_id?: string;
          parent_id?: string | null;
          body?: string;
          created_at?: string;
        };
      };
      comment_likes: {
        Row: {
          id: string;
          comment_id: string;
          profile_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          comment_id: string;
          profile_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          comment_id?: string;
          profile_id?: string;
          created_at?: string;
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
          meta_description: string | null;
          seo_title: string | null;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: {
      app_role: AppRole;
      project_file_type: ProjectFileType;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Insertable<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type Updatable<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string | null
          description: string | null
          event_date: string | null
          id: string
          location: string | null
          organizer_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_date?: string | null
          id?: string
          location?: string | null
          organizer_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_date?: string | null
          id?: string
          location?: string | null
          organizer_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          company: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          location: string | null
          posted_by: string | null
          requirements: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          company: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          posted_by?: string | null
          requirements?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          company?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          posted_by?: string | null
          requirements?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          company: string | null
          contact_email: string | null
          contact_linkedin: string | null
          contact_phone: string | null
          contact_whatsapp: string | null
          created_at: string | null
          department: string | null
          email_verified: boolean | null
          full_name: string
          graduation_year: number | null
          id: string
          industry: string | null
          job_title: string | null
          linkedin_url: string | null
          location: string | null
          pref_anonymous: boolean | null
          primary_contact_method:
            | Database["public"]["Enums"]["contact_method"]
            | null
          privacy_settings: Json | null
          profile_picture_url: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          show_email: boolean | null
          show_linkedin: boolean | null
          show_phone: boolean | null
          show_whatsapp: boolean | null
          skills: string[] | null
          updated_at: string | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          bio?: string | null
          company?: string | null
          contact_email?: string | null
          contact_linkedin?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          created_at?: string | null
          department?: string | null
          email_verified?: boolean | null
          full_name: string
          graduation_year?: number | null
          id?: string
          industry?: string | null
          job_title?: string | null
          linkedin_url?: string | null
          location?: string | null
          pref_anonymous?: boolean | null
          primary_contact_method?:
            | Database["public"]["Enums"]["contact_method"]
            | null
          privacy_settings?: Json | null
          profile_picture_url?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          show_email?: boolean | null
          show_linkedin?: boolean | null
          show_phone?: boolean | null
          show_whatsapp?: boolean | null
          skills?: string[] | null
          updated_at?: string | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          bio?: string | null
          company?: string | null
          contact_email?: string | null
          contact_linkedin?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          created_at?: string | null
          department?: string | null
          email_verified?: boolean | null
          full_name?: string
          graduation_year?: number | null
          id?: string
          industry?: string | null
          job_title?: string | null
          linkedin_url?: string | null
          location?: string | null
          pref_anonymous?: boolean | null
          primary_contact_method?:
            | Database["public"]["Enums"]["contact_method"]
            | null
          privacy_settings?: Json | null
          profile_picture_url?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          show_email?: boolean | null
          show_linkedin?: boolean | null
          show_phone?: boolean | null
          show_whatsapp?: boolean | null
          skills?: string[] | null
          updated_at?: string | null
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      contact_method: "email" | "linkedin" | "phone" | "whatsapp"
      user_role: "admin" | "verified_alumni" | "alumni" | "guest"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      contact_method: ["email", "linkedin", "phone", "whatsapp"],
      user_role: ["admin", "verified_alumni", "alumni", "guest"],
    },
  },
} as const

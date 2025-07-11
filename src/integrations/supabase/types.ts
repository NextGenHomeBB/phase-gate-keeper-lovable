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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      created_users_log: {
        Row: {
          admin_id: string
          created_at: string
          email: string
          id: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          must_reset_password: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          must_reset_password?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          must_reset_password?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      project_checklist_items: {
        Row: {
          completed: boolean
          created_at: string
          description: string
          id: string
          item_id: string
          notes: string | null
          phase_id: number
          project_id: string
          required: boolean
          updated_at: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          description: string
          id?: string
          item_id: string
          notes?: string | null
          phase_id: number
          project_id: string
          required?: boolean
          updated_at?: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          description?: string
          id?: string
          item_id?: string
          notes?: string | null
          phase_id?: number
          project_id?: string
          required?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_project_checklist_items_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_files: {
        Row: {
          file_data: string
          file_name: string
          file_size: number
          file_type: string
          id: string
          project_id: string
          updated_at: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          file_data: string
          file_name: string
          file_size: number
          file_type: string
          id?: string
          project_id: string
          updated_at?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          file_data?: string
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          project_id?: string
          updated_at?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_labour: {
        Row: {
          bill_per_hour: boolean
          cost_per_job: number | null
          created_at: string
          created_by: string | null
          hourly_rate: number | null
          hours: number | null
          id: string
          phase_id: number
          project_id: string
          subcontractor_id: string | null
          task: string
          updated_at: string
        }
        Insert: {
          bill_per_hour?: boolean
          cost_per_job?: number | null
          created_at?: string
          created_by?: string | null
          hourly_rate?: number | null
          hours?: number | null
          id?: string
          phase_id: number
          project_id: string
          subcontractor_id?: string | null
          task: string
          updated_at?: string
        }
        Update: {
          bill_per_hour?: boolean
          cost_per_job?: number | null
          created_at?: string
          created_by?: string | null
          hourly_rate?: number | null
          hours?: number | null
          id?: string
          phase_id?: number
          project_id?: string
          subcontractor_id?: string | null
          task?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_labour_subcontractor_id_fkey"
            columns: ["subcontractor_id"]
            isOneToOne: false
            referencedRelation: "sub_contractors"
            referencedColumns: ["id"]
          },
        ]
      }
      project_materials: {
        Row: {
          category: string
          checklist_item_id: string | null
          created_at: string
          created_by: string | null
          estimated_cost: number | null
          id: string
          is_manual: boolean
          name: string
          phase_id: number
          project_id: string
          quantity: number
          unit: string
          updated_at: string
          vat_percentage: number | null
        }
        Insert: {
          category?: string
          checklist_item_id?: string | null
          created_at?: string
          created_by?: string | null
          estimated_cost?: number | null
          id?: string
          is_manual?: boolean
          name: string
          phase_id: number
          project_id: string
          quantity?: number
          unit?: string
          updated_at?: string
          vat_percentage?: number | null
        }
        Update: {
          category?: string
          checklist_item_id?: string | null
          created_at?: string
          created_by?: string | null
          estimated_cost?: number | null
          id?: string
          is_manual?: boolean
          name?: string
          phase_id?: number
          project_id?: string
          quantity?: number
          unit?: string
          updated_at?: string
          vat_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_materials_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_phases: {
        Row: {
          actual_end_date: string | null
          actual_start_date: string | null
          color_index: number | null
          completed: boolean
          created_at: string
          description: string | null
          end_date: string | null
          estimated_duration_days: number | null
          id: string
          locked: boolean
          name: string
          phase_number: number
          project_id: string
          start_date: string | null
          updated_at: string
        }
        Insert: {
          actual_end_date?: string | null
          actual_start_date?: string | null
          color_index?: number | null
          completed?: boolean
          created_at?: string
          description?: string | null
          end_date?: string | null
          estimated_duration_days?: number | null
          id?: string
          locked?: boolean
          name: string
          phase_number: number
          project_id: string
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          actual_end_date?: string | null
          actual_start_date?: string | null
          color_index?: number | null
          completed?: boolean
          created_at?: string
          description?: string | null
          end_date?: string | null
          estimated_duration_days?: number | null
          id?: string
          locked?: boolean
          name?: string
          phase_number?: number
          project_id?: string
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_phases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_photos: {
        Row: {
          caption: string | null
          checklist_item_id: string | null
          created_at: string
          id: string
          phase_id: number | null
          photo_data: string | null
          photo_url: string
          project_id: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          caption?: string | null
          checklist_item_id?: string | null
          created_at?: string
          id?: string
          phase_id?: number | null
          photo_data?: string | null
          photo_url: string
          project_id: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          caption?: string | null
          checklist_item_id?: string | null
          created_at?: string
          id?: string
          phase_id?: number | null
          photo_data?: string | null
          photo_url?: string
          project_id?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_photos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_team_members: {
        Row: {
          created_at: string
          id: string
          project_id: string
          team_member_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          team_member_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          team_member_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_team_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_team_members_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          address: string | null
          building_year: number | null
          category_start_dates: Json | null
          city: string | null
          created_at: string | null
          created_by: string
          current_phase: number | null
          description: string | null
          energy_labels: Json | null
          executor: string | null
          existing_building_type: string | null
          id: string
          installation_concept: Json | null
          name: string
          number_of_units_after_split: number | null
          planned_delivery_date: string | null
          postal_code: string | null
          project_manager: string | null
          special_considerations: string | null
          start_date: string | null
          transformation_description: string | null
          unit_access_type: string | null
          unit_areas: Json | null
          unit_purposes: Json | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          building_year?: number | null
          category_start_dates?: Json | null
          city?: string | null
          created_at?: string | null
          created_by: string
          current_phase?: number | null
          description?: string | null
          energy_labels?: Json | null
          executor?: string | null
          existing_building_type?: string | null
          id?: string
          installation_concept?: Json | null
          name: string
          number_of_units_after_split?: number | null
          planned_delivery_date?: string | null
          postal_code?: string | null
          project_manager?: string | null
          special_considerations?: string | null
          start_date?: string | null
          transformation_description?: string | null
          unit_access_type?: string | null
          unit_areas?: Json | null
          unit_purposes?: Json | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          building_year?: number | null
          category_start_dates?: Json | null
          city?: string | null
          created_at?: string | null
          created_by?: string
          current_phase?: number | null
          description?: string | null
          energy_labels?: Json | null
          executor?: string | null
          existing_building_type?: string | null
          id?: string
          installation_concept?: Json | null
          name?: string
          number_of_units_after_split?: number | null
          planned_delivery_date?: string | null
          postal_code?: string | null
          project_manager?: string | null
          special_considerations?: string | null
          start_date?: string | null
          transformation_description?: string | null
          unit_access_type?: string | null
          unit_areas?: Json | null
          unit_purposes?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sub_contractors: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          trade_specialty: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          trade_specialty: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          trade_specialty?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee_id: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tasks_assignee_profiles"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_member_roles: {
        Row: {
          created_at: string
          id: string
          role_name: string
          team_member_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          role_name: string
          team_member_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          role_name?: string
          team_member_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_team_member_roles_team_member"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          role_title: string | null
          start_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          role_title?: string | null
          start_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role_title?: string | null
          start_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "user" | "worker"
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
      app_role: ["admin", "manager", "user", "worker"],
    },
  },
} as const

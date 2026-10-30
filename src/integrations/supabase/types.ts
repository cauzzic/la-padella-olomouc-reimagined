export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      drink_categories: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      drinks: {
        Row: {
          allergens: number[]
          brand: string | null
          category_id: string
          created_at: string
          description: string
          id: string
          image_path: string | null
          is_active: boolean
          name: string
          price: number
          sort_order: number
          updated_at: string
          volume: string | null
        }
        Insert: {
          allergens?: number[]
          brand?: string | null
          category_id: string
          created_at?: string
          description?: string
          id?: string
          image_path?: string | null
          is_active?: boolean
          name: string
          price?: number
          sort_order?: number
          updated_at?: string
          volume?: string | null
        }
        Update: {
          allergens?: number[]
          brand?: string | null
          category_id?: string
          created_at?: string
          description?: string
          id?: string
          image_path?: string | null
          is_active?: boolean
          name?: string
          price?: number
          sort_order?: number
          updated_at?: string
          volume?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drinks_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "drink_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          allergens: number[]
          category_id: string
          created_at: string
          description: string
          id: string
          image_path: string | null
          is_active: boolean
          is_featured: boolean
          is_vegetarian: boolean
          name: string
          portion: string | null
          price: number | null
          price_note: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          allergens?: number[]
          category_id: string
          created_at?: string
          description?: string
          id?: string
          image_path?: string | null
          is_active?: boolean
          is_featured?: boolean
          is_vegetarian?: boolean
          name: string
          portion?: string | null
          price?: number | null
          price_note?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          allergens?: number[]
          category_id?: string
          created_at?: string
          description?: string
          id?: string
          image_path?: string | null
          is_active?: boolean
          is_featured?: boolean
          is_vegetarian?: boolean
          name?: string
          portion?: string | null
          price?: number | null
          price_note?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          allergens: number[]
          created_at: string
          description: string
          id: string
          image_path: string | null
          is_active: boolean
          label: string | null
          price: number | null
          sort_order: number
          title: string
          updated_at: string
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          allergens?: number[]
          created_at?: string
          description?: string
          id?: string
          image_path?: string | null
          is_active?: boolean
          label?: string | null
          price?: number | null
          sort_order?: number
          title: string
          updated_at?: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          allergens?: number[]
          created_at?: string
          description?: string
          id?: string
          image_path?: string | null
          is_active?: boolean
          label?: string | null
          price?: number | null
          sort_order?: number
          title?: string
          updated_at?: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weekly_menu_dishes: {
        Row: {
          allergens: number[]
          created_at: string
          description: string
          id: string
          kind: string
          menu_id: string
          name: string
          price: number | null
          sort_order: number
          weekday: number
        }
        Insert: {
          allergens?: number[]
          created_at?: string
          description?: string
          id?: string
          kind: string
          menu_id: string
          name: string
          price?: number | null
          sort_order?: number
          weekday: number
        }
        Update: {
          allergens?: number[]
          created_at?: string
          description?: string
          id?: string
          kind?: string
          menu_id?: string
          name?: string
          price?: number | null
          sort_order?: number
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "weekly_menu_dishes_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "weekly_menus"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_menus: {
        Row: {
          created_at: string
          id: string
          is_published: boolean
          note: string | null
          title: string
          updated_at: string
          valid_from: string
          valid_to: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_published?: boolean
          note?: string | null
          title?: string
          updated_at?: string
          valid_from: string
          valid_to: string
        }
        Update: {
          created_at?: string
          id?: string
          is_published?: boolean
          note?: string | null
          title?: string
          updated_at?: string
          valid_from?: string
          valid_to?: string
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
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "editor"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "editor"],
    },
  },
} as const

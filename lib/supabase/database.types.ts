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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analytics_counters: {
        Row: {
          count: number
          entity_id: string | null
          event_date: string | null
          id: string
          kind: string
          name: string
          updated_at: string
        }
        Insert: {
          count?: number
          entity_id?: string | null
          event_date?: string | null
          id: string
          kind: string
          name?: string
          updated_at?: string
        }
        Update: {
          count?: number
          entity_id?: string | null
          event_date?: string | null
          id?: string
          kind?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      app_admins: {
        Row: {
          created_at: string
          email: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string
          id: string
          image: Json
          linked_products: string[]
          name: string
          slug: string
          sort_order: number
          updated_at: string
          visible: boolean
        }
        Insert: {
          created_at?: string
          description?: string
          id: string
          image: Json
          linked_products?: string[]
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
          visible?: boolean
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          image?: Json
          linked_products?: string[]
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      collections: {
        Row: {
          created_at: string
          description: string
          id: string
          image: Json
          linked_products: string[]
          name: string
          slug: string
          sort_order: number
          updated_at: string
          visible: boolean
        }
        Insert: {
          created_at?: string
          description?: string
          id: string
          image: Json
          linked_products?: string[]
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
          visible?: boolean
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          image?: Json
          linked_products?: string[]
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          expires_at: string
          id: string
          min_order: number
          sort_order: number
          type: string
          updated_at: string
          usage_count: number
          usage_limit: number
          value: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          expires_at: string
          id: string
          min_order?: number
          sort_order?: number
          type: string
          updated_at?: string
          usage_count?: number
          usage_limit: number
          value: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          min_order?: number
          sort_order?: number
          type?: string
          updated_at?: string
          usage_count?: number
          usage_limit?: number
          value?: number
        }
        Relationships: []
      }
      hero_settings: {
        Row: {
          auto_play: boolean
          auto_play_interval: number
          background_blur: number
          floating_effect: boolean
          id: string
          show_hero: boolean
          side_scale: number
          transition_speed: number
          updated_at: string
        }
        Insert: {
          auto_play?: boolean
          auto_play_interval?: number
          background_blur?: number
          floating_effect?: boolean
          id?: string
          show_hero?: boolean
          side_scale?: number
          transition_speed?: number
          updated_at?: string
        }
        Update: {
          auto_play?: boolean
          auto_play_interval?: number
          background_blur?: number
          floating_effect?: boolean
          id?: string
          show_hero?: boolean
          side_scale?: number
          transition_speed?: number
          updated_at?: string
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          auto_contrast: boolean
          created_at: string
          cta_text: string
          destination_type: string
          destination_value: string
          end_date: string | null
          focus_x: number
          focus_y: number
          id: string
          image: Json
          is_active: boolean
          mobile_image: Json | null
          sort_order: number
          start_date: string | null
          subtitle: string
          title: string
          updated_at: string
        }
        Insert: {
          auto_contrast?: boolean
          created_at?: string
          cta_text?: string
          destination_type?: string
          destination_value?: string
          end_date?: string | null
          focus_x?: number
          focus_y?: number
          id: string
          image: Json
          is_active?: boolean
          mobile_image?: Json | null
          sort_order?: number
          start_date?: string | null
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Update: {
          auto_contrast?: boolean
          created_at?: string
          cta_text?: string
          destination_type?: string
          destination_value?: string
          end_date?: string | null
          focus_x?: number
          focus_y?: number
          id?: string
          image?: Json
          is_active?: boolean
          mobile_image?: Json | null
          sort_order?: number
          start_date?: string | null
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      menu_icons: {
        Row: {
          id: string
          new_icon: Json | null
          offers_icon: Json | null
          sets_icon: Json | null
          trend_icon: Json | null
          updated_at: string
        }
        Insert: {
          id?: string
          new_icon?: Json | null
          offers_icon?: Json | null
          sets_icon?: Json | null
          trend_icon?: Json | null
          updated_at?: string
        }
        Update: {
          id?: string
          new_icon?: Json | null
          offers_icon?: Json | null
          sets_icon?: Json | null
          trend_icon?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      notification_campaigns: {
        Row: {
          body: string
          campaign_id: string | null
          created_at: string
          error_codes: Json
          failed: number
          firebase_accepted: boolean
          id: string
          sent_by: string | null
          settings_complete: boolean
          success: number
          target: string
          title: string
          total: number
        }
        Insert: {
          body: string
          campaign_id?: string | null
          created_at?: string
          error_codes?: Json
          failed?: number
          firebase_accepted?: boolean
          id: string
          sent_by?: string | null
          settings_complete?: boolean
          success?: number
          target?: string
          title: string
          total?: number
        }
        Update: {
          body?: string
          campaign_id?: string | null
          created_at?: string
          error_codes?: Json
          failed?: number
          firebase_accepted?: boolean
          id?: string
          sent_by?: string | null
          settings_complete?: boolean
          success?: number
          target?: string
          title?: string
          total?: number
        }
        Relationships: []
      }
      notification_subscriptions: {
        Row: {
          active: boolean
          created_at: string
          deactivated_at: string | null
          deactivation_reason: string | null
          id: string
          token: string
          updated_at: string
          user_agent: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          deactivated_at?: string | null
          deactivation_reason?: string | null
          id: string
          token: string
          updated_at?: string
          user_agent?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          deactivated_at?: string | null
          deactivation_reason?: string | null
          id?: string
          token?: string
          updated_at?: string
          user_agent?: string
        }
        Relationships: []
      }
      production_orders: {
        Row: {
          created_at: string | null
          customer: string
          gift_message: string
          id: string
          is_gift: boolean
          notes: string
          phone: string
          products: string[]
          status: string
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          customer: string
          gift_message?: string
          id: string
          is_gift?: boolean
          notes?: string
          phone: string
          products?: string[]
          status: string
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          customer?: string
          gift_message?: string
          id?: string
          is_gift?: boolean
          notes?: string
          phone?: string
          products?: string[]
          status?: string
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      production_products: {
        Row: {
          accordion_care: string | null
          accordion_details: string | null
          accordion_returns: string | null
          accordion_shipping: string | null
          badge_icons: string[]
          badges: string[]
          brand: string | null
          category: string
          category_ids: string[]
          colors: string[]
          compare_at: number | null
          created_at: string
          description: string
          discount_ends_at: string | null
          id: string
          images: Json
          inventory_status: string
          material: string
          name: string
          price: number
          rating: number
          rating_label: string | null
          reviews: number
          scarcity_text: string
          show_colors: boolean
          show_quantity: boolean
          show_scarcity: boolean
          show_sizes: boolean
          sizes: string[]
          slug: string
          sold: number
          sort_order: number
          status: string[]
          stock: number
          tags: string[]
          trust_messages: Json
          updated_at: string
          videos: Json
          views: number
          visible: boolean
          whatsapp_cta_text: string | null
        }
        Insert: {
          accordion_care?: string | null
          accordion_details?: string | null
          accordion_returns?: string | null
          accordion_shipping?: string | null
          badge_icons?: string[]
          badges?: string[]
          brand?: string | null
          category?: string
          category_ids?: string[]
          colors?: string[]
          compare_at?: number | null
          created_at?: string
          description?: string
          discount_ends_at?: string | null
          id: string
          images?: Json
          inventory_status?: string
          material?: string
          name: string
          price?: number
          rating?: number
          rating_label?: string | null
          reviews?: number
          scarcity_text?: string
          show_colors?: boolean
          show_quantity?: boolean
          show_scarcity?: boolean
          show_sizes?: boolean
          sizes?: string[]
          slug: string
          sold?: number
          sort_order?: number
          status?: string[]
          stock?: number
          tags?: string[]
          trust_messages?: Json
          updated_at?: string
          videos?: Json
          views?: number
          visible?: boolean
          whatsapp_cta_text?: string | null
        }
        Update: {
          accordion_care?: string | null
          accordion_details?: string | null
          accordion_returns?: string | null
          accordion_shipping?: string | null
          badge_icons?: string[]
          badges?: string[]
          brand?: string | null
          category?: string
          category_ids?: string[]
          colors?: string[]
          compare_at?: number | null
          created_at?: string
          description?: string
          discount_ends_at?: string | null
          id?: string
          images?: Json
          inventory_status?: string
          material?: string
          name?: string
          price?: number
          rating?: number
          rating_label?: string | null
          reviews?: number
          scarcity_text?: string
          show_colors?: boolean
          show_quantity?: boolean
          show_scarcity?: boolean
          show_sizes?: boolean
          sizes?: string[]
          slug?: string
          sold?: number
          sort_order?: number
          status?: string[]
          stock?: number
          tags?: string[]
          trust_messages?: Json
          updated_at?: string
          videos?: Json
          views?: number
          visible?: boolean
          whatsapp_cta_text?: string | null
        }
        Relationships: []
      }
      site_content: {
        Row: {
          accordion_care: string
          accordion_details: string
          accordion_returns: string
          accordion_shipping: string
          hero_badge: string
          hero_description: string
          hero_title: string
          id: string
          offer_messages: string[]
          primary_cta: string
          secondary_cta: string
          show_active_coupons: boolean
          updated_at: string
        }
        Insert: {
          accordion_care?: string
          accordion_details?: string
          accordion_returns?: string
          accordion_shipping?: string
          hero_badge?: string
          hero_description?: string
          hero_title?: string
          id?: string
          offer_messages?: string[]
          primary_cta?: string
          secondary_cta?: string
          show_active_coupons?: boolean
          updated_at?: string
        }
        Update: {
          accordion_care?: string
          accordion_details?: string
          accordion_returns?: string
          accordion_shipping?: string
          hero_badge?: string
          hero_description?: string
          hero_title?: string
          id?: string
          offer_messages?: string[]
          primary_cta?: string
          secondary_cta?: string
          show_active_coupons?: boolean
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      abort_migration_run: { Args: { p_run_id: string }; Returns: undefined }
      begin_migration_run: {
        Args: { p_manifest: Json; p_project_ref: string; p_run_id: string }
        Returns: undefined
      }
      consume_coupon: { Args: { p_code: string }; Returns: Json }
      finalize_migration_run: {
        Args: { p_project_ref: string; p_run_id: string }
        Returns: Json
      }
      increment_analytics_counter: {
        Args: {
          p_entity_id?: string
          p_event_date?: string
          p_id: string
          p_kind: string
          p_name?: string
        }
        Returns: undefined
      }
      record_analytics_event: {
        Args: {
          p_collection_id?: string
          p_collection_name?: string
          p_product_id?: string
          p_product_name?: string
          p_type: string
        }
        Returns: undefined
      }
      record_store_analytics_event: {
        Args: { p_event: Json; p_items?: Json }
        Returns: boolean
      }
      get_store_analytics_dashboard: {
        Args: { p_from: string; p_to: string }
        Returns: Json
      }
      replace_coupons: { Args: { p_rows: Json }; Returns: undefined }
      replace_hero_slides: { Args: { p_rows: Json }; Returns: undefined }
      reset_analytics: { Args: never; Returns: number }
      reset_notification_subscriptions: { Args: never; Returns: number }
      stage_migration_rows: {
        Args: { p_rows: Json; p_run_id: string; p_table_name: string }
        Returns: number
      }
      swap_category_sort_order: {
        Args: { p_first_id: string; p_second_id: string }
        Returns: undefined
      }
      swap_collection_sort_order: {
        Args: { p_first_id: string; p_second_id: string }
        Returns: undefined
      }
      swap_product_sort_order: {
        Args: { p_first_id: string; p_second_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

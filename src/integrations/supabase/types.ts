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
      catalog_products: {
        Row: {
          affiliate_link: string | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          image_url: string | null
          images: string[] | null
          is_on_sale: boolean | null
          is_verified: boolean
          original_price: number | null
          price: number | null
          product_id: string
          product_name: string
          promo_info: string | null
          raw_payload: Json | null
          shop_cipher: string | null
          size_chart_url: string | null
          source_platform: string
          status: string
          updated_at: string
          variants: string | null
        }
        Insert: {
          affiliate_link?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_on_sale?: boolean | null
          is_verified?: boolean
          original_price?: number | null
          price?: number | null
          product_id: string
          product_name: string
          promo_info?: string | null
          raw_payload?: Json | null
          shop_cipher?: string | null
          size_chart_url?: string | null
          source_platform?: string
          status?: string
          updated_at?: string
          variants?: string | null
        }
        Update: {
          affiliate_link?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_on_sale?: boolean | null
          is_verified?: boolean
          original_price?: number | null
          price?: number | null
          product_id?: string
          product_name?: string
          promo_info?: string | null
          raw_payload?: Json | null
          shop_cipher?: string | null
          size_chart_url?: string | null
          source_platform?: string
          status?: string
          updated_at?: string
          variants?: string | null
        }
        Relationships: []
      }
      media_jobs: {
        Row: {
          agent1_metadata: Json | null
          avatar_id: string | null
          avatar_name: string | null
          camera_style: string | null
          created_at: string
          duration: string | null
          energy: number | null
          enhancements: string[] | null
          error_message: string | null
          id: string
          image_prompt: string | null
          image_storage_key: string | null
          image_url: string | null
          interaction: string | null
          master_prompt: string | null
          pose: string | null
          product_id: string | null
          product_name: string | null
          proximity: number | null
          scenario_tags: string[] | null
          scenario_text: string | null
          script: string | null
          script_prompt: Json | null
          status: string
          updated_at: string
          user_id: string
          video_style: string | null
          voice_energy: string | null
          voice_gender: string | null
          voice_style: string | null
          voice_tone: string | null
          warnings: Json | null
        }
        Insert: {
          agent1_metadata?: Json | null
          avatar_id?: string | null
          avatar_name?: string | null
          camera_style?: string | null
          created_at?: string
          duration?: string | null
          energy?: number | null
          enhancements?: string[] | null
          error_message?: string | null
          id?: string
          image_prompt?: string | null
          image_storage_key?: string | null
          image_url?: string | null
          interaction?: string | null
          master_prompt?: string | null
          pose?: string | null
          product_id?: string | null
          product_name?: string | null
          proximity?: number | null
          scenario_tags?: string[] | null
          scenario_text?: string | null
          script?: string | null
          script_prompt?: Json | null
          status?: string
          updated_at?: string
          user_id: string
          video_style?: string | null
          voice_energy?: string | null
          voice_gender?: string | null
          voice_style?: string | null
          voice_tone?: string | null
          warnings?: Json | null
        }
        Update: {
          agent1_metadata?: Json | null
          avatar_id?: string | null
          avatar_name?: string | null
          camera_style?: string | null
          created_at?: string
          duration?: string | null
          energy?: number | null
          enhancements?: string[] | null
          error_message?: string | null
          id?: string
          image_prompt?: string | null
          image_storage_key?: string | null
          image_url?: string | null
          interaction?: string | null
          master_prompt?: string | null
          pose?: string | null
          product_id?: string | null
          product_name?: string | null
          proximity?: number | null
          scenario_tags?: string[] | null
          scenario_text?: string | null
          script?: string | null
          script_prompt?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
          video_style?: string | null
          voice_energy?: string | null
          voice_gender?: string | null
          voice_style?: string | null
          voice_tone?: string | null
          warnings?: Json | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_id: string
          created_at: string
          id: string
          name: string
          tiktok_handle: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_id?: string
          created_at?: string
          id?: string
          name?: string
          tiktok_handle?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_id?: string
          created_at?: string
          id?: string
          name?: string
          tiktok_handle?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stores: {
        Row: {
          access_code: string
          created_at: string
          footer_bg_color: string | null
          footer_logo_color: string | null
          footer_text_color: string | null
          id: string
          instagram_url: string | null
          is_public: boolean
          preview_cache: string | null
          slug: string
          store_name: string
          support_email: string | null
          tiktok_url: string | null
          updated_at: string
          user_id: string
          youtube_url: string | null
        }
        Insert: {
          access_code?: string
          created_at?: string
          footer_bg_color?: string | null
          footer_logo_color?: string | null
          footer_text_color?: string | null
          id?: string
          instagram_url?: string | null
          is_public?: boolean
          preview_cache?: string | null
          slug?: string
          store_name?: string
          support_email?: string | null
          tiktok_url?: string | null
          updated_at?: string
          user_id: string
          youtube_url?: string | null
        }
        Update: {
          access_code?: string
          created_at?: string
          footer_bg_color?: string | null
          footer_logo_color?: string | null
          footer_text_color?: string | null
          id?: string
          instagram_url?: string | null
          is_public?: boolean
          preview_cache?: string | null
          slug?: string
          store_name?: string
          support_email?: string | null
          tiktok_url?: string | null
          updated_at?: string
          user_id?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      tiktok_shop_tokens: {
        Row: {
          access_token: string
          access_token_expires_at: string
          app_key: string
          created_at: string
          id: string
          open_id: string | null
          refresh_token: string
          refresh_token_expires_at: string
          seller_base_region: string | null
          seller_name: string | null
          shop_cipher: string | null
          updated_at: string
        }
        Insert: {
          access_token: string
          access_token_expires_at: string
          app_key: string
          created_at?: string
          id?: string
          open_id?: string | null
          refresh_token: string
          refresh_token_expires_at: string
          seller_base_region?: string | null
          seller_name?: string | null
          shop_cipher?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string
          access_token_expires_at?: string
          app_key?: string
          created_at?: string
          id?: string
          open_id?: string | null
          refresh_token?: string
          refresh_token_expires_at?: string
          seller_base_region?: string | null
          seller_name?: string | null
          shop_cipher?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_products: {
        Row: {
          affiliate_url: string | null
          catalog_product_id: string
          category: string | null
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          affiliate_url?: string | null
          catalog_product_id: string
          category?: string | null
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          affiliate_url?: string | null
          catalog_product_id?: string
          category?: string | null
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_products_catalog_product_id_fkey"
            columns: ["catalog_product_id"]
            isOneToOne: false
            referencedRelation: "catalog_products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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

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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      games: {
        Row: {
          auto_update_enabled: boolean | null
          away_numbers: number[] | null
          away_score: number | null
          away_team: string
          created_at: string | null
          created_by: string
          current_quarter: string | null
          external_game_key: string | null
          group_id: string
          home_numbers: number[] | null
          home_score: number | null
          home_team: string
          id: string
          last_api_sync: string | null
          last_score_update: string | null
          max_squares_per_user: number | null
          name: string
          numbers_assigned_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          auto_update_enabled?: boolean | null
          away_numbers?: number[] | null
          away_score?: number | null
          away_team: string
          created_at?: string | null
          created_by: string
          current_quarter?: string | null
          external_game_key?: string | null
          group_id: string
          home_numbers?: number[] | null
          home_score?: number | null
          home_team: string
          id?: string
          last_api_sync?: string | null
          last_score_update?: string | null
          max_squares_per_user?: number | null
          name: string
          numbers_assigned_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          auto_update_enabled?: boolean | null
          away_numbers?: number[] | null
          away_score?: number | null
          away_team?: string
          created_at?: string | null
          created_by?: string
          current_quarter?: string | null
          external_game_key?: string | null
          group_id?: string
          home_numbers?: number[] | null
          home_score?: number | null
          home_team?: string
          id?: string
          last_api_sync?: string | null
          last_score_update?: string | null
          max_squares_per_user?: number | null
          name?: string
          numbers_assigned_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "games_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string | null
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          buy_in_amount: number | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          invite_code: string
          name: string
          payout_final: number | null
          payout_q1: number | null
          payout_q2: number | null
          payout_q3: number | null
          updated_at: string | null
        }
        Insert: {
          buy_in_amount?: number | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          invite_code: string
          name: string
          payout_final?: number | null
          payout_q1?: number | null
          payout_q2?: number | null
          payout_q3?: number | null
          updated_at?: string | null
        }
        Update: {
          buy_in_amount?: number | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          invite_code?: string
          name?: string
          payout_final?: number | null
          payout_q1?: number | null
          payout_q2?: number | null
          payout_q3?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      presence: {
        Row: {
          game_id: string
          id: string
          last_seen: string | null
          user_id: string
        }
        Insert: {
          game_id: string
          id?: string
          last_seen?: string | null
          user_id: string
        }
        Update: {
          game_id?: string
          id?: string
          last_seen?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "presence_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presence_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      quarter_winners: {
        Row: {
          away_score: number
          game_id: string
          home_score: number
          id: string
          quarter: string
          recorded_at: string | null
          square_id: string | null
          user_id: string | null
        }
        Insert: {
          away_score: number
          game_id: string
          home_score: number
          id?: string
          quarter: string
          recorded_at?: string | null
          square_id?: string | null
          user_id?: string | null
        }
        Update: {
          away_score?: number
          game_id?: string
          home_score?: number
          id?: string
          quarter?: string
          recorded_at?: string | null
          square_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quarter_winners_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quarter_winners_square_id_fkey"
            columns: ["square_id"]
            isOneToOne: false
            referencedRelation: "squares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quarter_winners_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      squares: {
        Row: {
          claimed_at: string | null
          col: number
          game_id: string
          id: string
          row: number
          user_id: string | null
          version: number
        }
        Insert: {
          claimed_at?: string | null
          col: number
          game_id: string
          id?: string
          row: number
          user_id?: string | null
          version?: number
        }
        Update: {
          claimed_at?: string | null
          col?: number
          game_id?: string
          id?: string
          row?: number
          user_id?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "squares_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "squares_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_payments: {
        Row: {
          amount_owed: number
          amount_paid: number
          created_at: string | null
          group_id: string
          id: string
          is_paid: boolean | null
          last_payment_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_owed?: number
          amount_paid?: number
          created_at?: string | null
          group_id: string
          id?: string
          is_paid?: boolean | null
          last_payment_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_owed?: number
          amount_paid?: number
          created_at?: string | null
          group_id?: string
          id?: string
          is_paid?: boolean | null
          last_payment_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_payments_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_square: {
        Args: {
          p_expected_version: number
          p_game_id: string
          p_square_id: string
          p_user_id: string
        }
        Returns: {
          message: string
          new_version: number
          success: boolean
        }[]
      }
      get_group_by_invite_code: {
        Args: { code: string }
        Returns: {
          created_at: string
          created_by: string
          description: string
          id: string
          invite_code: string
          name: string
          updated_at: string
        }[]
      }
      initialize_game_squares: {
        Args: { p_game_id: string }
        Returns: undefined
      }
      randomize_game_numbers: {
        Args: { p_game_id: string }
        Returns: undefined
      }
      record_quarter_winner: {
        Args: { p_game_id: string; p_quarter: string }
        Returns: {
          winner_name: string
          winner_square_id: string
          winner_user_id: string
        }[]
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

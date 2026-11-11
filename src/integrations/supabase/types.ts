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
      church_events: {
        Row: {
          created_at: string
          description: string
          end_date: string | null
          event_date: string
          flyer_path: string | null
          id: string
          is_featured: boolean
          is_published: boolean
          location: string
          status: string
          theme: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          end_date?: string | null
          event_date: string
          flyer_path?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          location?: string
          status?: string
          theme?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          end_date?: string | null
          event_date?: string
          flyer_path?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          location?: string
          status?: string
          theme?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      exam_attempts: {
        Row: {
          answers: Json
          auto_submitted: boolean
          created_at: string
          exam_id: string
          id: string
          score: number
          student_name: string
          tab_switches: number
          total_marks: number
        }
        Insert: {
          answers?: Json
          auto_submitted?: boolean
          created_at?: string
          exam_id: string
          id?: string
          score?: number
          student_name: string
          tab_switches?: number
          total_marks?: number
        }
        Update: {
          answers?: Json
          auto_submitted?: boolean
          created_at?: string
          exam_id?: string
          id?: string
          score?: number
          student_name?: string
          tab_switches?: number
          total_marks?: number
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_questions: {
        Row: {
          correct_answer: string
          created_at: string
          exam_id: string
          id: string
          marks: number
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          position: number
          question: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          exam_id: string
          id?: string
          marks?: number
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          position?: number
          question: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          exam_id?: string
          id?: string
          marks?: number
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          position?: number
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_photos: {
        Row: {
          caption: string | null
          category: string
          created_at: string
          display_order: number
          id: string
          is_visible: boolean
          storage_path: string
          updated_at: string
        }
        Insert: {
          caption?: string | null
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          is_visible?: boolean
          storage_path: string
          updated_at?: string
        }
        Update: {
          caption?: string | null
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          is_visible?: boolean
          storage_path?: string
          updated_at?: string
        }
        Relationships: []
      }
      library_books: {
        Row: {
          category: string
          created_at: string
          description: string | null
          display_order: number
          file_name: string
          file_size: number | null
          id: string
          is_visible: boolean
          storage_path: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number
          file_name: string
          file_size?: number | null
          id?: string
          is_visible?: boolean
          storage_path: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number
          file_name?: string
          file_size?: number | null
          id?: string
          is_visible?: boolean
          storage_path?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      pastoral_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          sender_type: Database["public"]["Enums"]["pastoral_sender_type"]
          submission_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sender_type: Database["public"]["Enums"]["pastoral_sender_type"]
          submission_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sender_type?: Database["public"]["Enums"]["pastoral_sender_type"]
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pastoral_messages_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "pastoral_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      pastoral_submissions: {
        Row: {
          access_code_hash: string
          category: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["pastoral_submission_status"]
          title: string
          updated_at: string
        }
        Insert: {
          access_code_hash: string
          category: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["pastoral_submission_status"]
          title: string
          updated_at?: string
        }
        Update: {
          access_code_hash?: string
          category?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["pastoral_submission_status"]
          title?: string
          updated_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_exam_for_student: { Args: { p_exam_id: string }; Returns: Json }
      get_thread_by_code: { Args: { p_access_code: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      reply_to_thread: {
        Args: { p_access_code: string; p_message: string }
        Returns: Json
      }
      submit_exam:
        | {
            Args: {
              p_answers: Json
              p_auto?: boolean
              p_exam_id: string
              p_student_name: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_answers: Json
              p_auto?: boolean
              p_exam_id: string
              p_student_name: string
              p_tab_switches?: number
            }
            Returns: Json
          }
      submit_issue: {
        Args: { p_category: string; p_message: string; p_title: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "pastor" | "moderator" | "user"
      pastoral_sender_type: "visitor" | "pastor"
      pastoral_submission_status:
        | "pending"
        | "in_review"
        | "responded"
        | "resolved"
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
      app_role: ["admin", "pastor", "moderator", "user"],
      pastoral_sender_type: ["visitor", "pastor"],
      pastoral_submission_status: [
        "pending",
        "in_review",
        "responded",
        "resolved",
      ],
    },
  },
} as const

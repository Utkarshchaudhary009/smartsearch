export type Database = {
  public: {
    Tables: {
      smartusers: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          clerk_id: string;
          name: string | null;
          email: string | null;
          first_name: string | null;
          last_name: string | null;
          image_url: string | null;
          primary_email_address_id: string | null;
          primary_phone_number_id: string | null;
          phone: string | null;
          role: string;
          email_verified_at: string | null;
          phone_verified_at: string | null;
          last_login_at: string | null;
          is_active: boolean;
          metadata: Record<string, {role:string}>;
          marketing_consent: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          clerk_id: string;
          name?: string | null;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          image_url?: string | null;
          primary_email_address_id?: string | null;
          primary_phone_number_id?: string | null;
          phone?: string | null;
          role?: string;
          email_verified_at?: string | null;
          phone_verified_at?: string | null;
          last_login_at?: string | null;
          is_active?: boolean;
          metadata?: Record<string, {role:string}>;
          marketing_consent?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          clerk_id?: string;
          name?: string | null;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          image_url?: string | null;
          primary_email_address_id?: string | null;
          primary_phone_number_id?: string | null;
          phone?: string | null;
          role?: string;
          email_verified_at?: string | null;
          phone_verified_at?: string | null;
          last_login_at?: string | null;
          is_active?: boolean;
          metadata?: Record<string, {role:string}>;
          marketing_consent?: boolean;
        };
      };
      chat_history: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          clerk_id: string;
          query: string;
          response: string;
          chat_slug: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          clerk_id: string;
          query: string;
          response: string;
          chat_slug: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          clerk_id?: string;
          query?: string;
          response?: string;
          chat_slug?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

export type SmartUser = Database["public"]["Tables"]["smartusers"]["Row"];
export type ChatHistory = Database["public"]["Tables"]["chat_history"]["Row"];
export type ChatSlug = Database["public"]["Tables"]["chat_history"]["Row"]["chat_slug"];

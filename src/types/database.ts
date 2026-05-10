export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string;
          user_id: string | null;
          email: string;
          name: string | null;
          avatar_url: string | null;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          role?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          phone: string | null;
          created_at: string;
          isContractor: boolean | null;
          address: string | null;
          cep: string | null;
          cpfcnpj: string | null;
          status: boolean | null;
          updated_at: string | null;
          push: string | null;
          endRegister: boolean | null;
          photo_url: string | null;
          name_contractor: string | null;
          rating: number | null;
          state: string | null;
          city: string | null;
          latLng: string | null;
          place_name: string | null;
          app: string | null;
          bio: string | null;
          fcm_token: string | null;
          ban: boolean | null;
          type_company: string | null;
          chave_pix: string | null;
        };
        Insert: { [key: string]: Json | undefined };
        Update: { [key: string]: Json | undefined };
      };
      services: {
        Row: {
          id: string;
          userId: string | null;
          userAproved: string | null;
          categoryId: string | null;
          jobType: string | null;
          name: string | null;
          description: string | null;
          dateStart: string | null;
          dateEnd: string | null;
          skill: string | null;
          cep: string | null;
          address: string | null;
          price: number | null;
          time: string | null;
          condition: string | null;
          status: boolean | null;
          created_at: string | null;
          updated_at: string | null;
          candidated: number | null;
          endRegister: boolean | null;
          latLng: string | null;
        };
        Insert: { [key: string]: Json | undefined };
        Update: { [key: string]: Json | undefined };
      };
      services_candidated: {
        Row: {
          id: string;
          serviceId: string | null;
          userId: string | null;
          aproved: boolean | null;
          created_at: string;
          description: string | null;
        };
        Insert: { [key: string]: Json | undefined };
        Update: { [key: string]: Json | undefined };
      };
      services_rating: {
        Row: {
          id: string;
          serviceId: string | null;
          contractor_comment: string | null;
          contractor_rating: number | null;
          prestador_comment: string | null;
          prestador_rating: number | null;
          created_at: string;
          contractor: string | null;
          prestador: string | null;
        };
        Insert: { [key: string]: Json | undefined };
        Update: { [key: string]: Json | undefined };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          asaas_subscription_id: string | null;
          asaas_customer_id: string | null;
          status: string;
          billing_cycle: string;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean | null;
          canceled_at: string | null;
          trial_start: string | null;
          trial_end: string | null;
          metadata: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: { [key: string]: Json | undefined };
        Update: { [key: string]: Json | undefined };
      };
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price_monthly: number | null;
          price_yearly: number | null;
          credits_per_month: number | null;
          is_unlimited: boolean | null;
          is_free: boolean | null;
          is_active: boolean | null;
          sort_order: number | null;
          type: string | null;
          plan_type: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: { [key: string]: Json | undefined };
        Update: { [key: string]: Json | undefined };
      };
      credit_balances: {
        Row: {
          id: string;
          user_id: string;
          subscription_id: string | null;
          period_start: string;
          period_end: string;
          credits_granted: number;
          credits_used: number | null;
          credits_remaining: number | null;
          is_unlimited: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: { [key: string]: Json | undefined };
        Update: { [key: string]: Json | undefined };
      };
      categories: {
        Row: {
          id: string;
          name: string | null;
          status: boolean | null;
          created_at: string;
        };
        Insert: { [key: string]: Json | undefined };
        Update: { [key: string]: Json | undefined };
      };
      leads: {
        Row: {
          id: string;
          userId: string | null;
          name: string | null;
          description: string | null;
          type_supplier: string | null;
          budget: number | null;
          quantity: number | null;
          return_deadline: string | null;
          finished: boolean | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: { [key: string]: Json | undefined };
        Update: { [key: string]: Json | undefined };
      };
      lead_contact: {
        Row: {
          id: string;
          leadId: string | null;
          userId: string | null;
          name: string | null;
          phone: string | null;
          email: string | null;
          created_at: string;
        };
        Insert: { [key: string]: Json | undefined };
        Update: { [key: string]: Json | undefined };
      };
      lead_attachment: {
        Row: {
          id: string;
          leadId: string | null;
          url: string | null;
          name: string | null;
          type: string | null;
          created_at: string;
        };
        Insert: { [key: string]: Json | undefined };
        Update: { [key: string]: Json | undefined };
      };
      chats: {
        Row: {
          id: string;
          userIdA: string | null;
          userIdB: string | null;
          serviceId: string | null;
          leadId: string | null;
          last_message: string | null;
          last_message_at: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: { [key: string]: Json | undefined };
        Update: { [key: string]: Json | undefined };
      };
      chats_message: {
        Row: {
          id: string;
          chatId: string | null;
          senderId: string | null;
          type: string | null;
          content: string | null;
          media_url: string | null;
          read: boolean | null;
          created_at: string;
        };
        Insert: { [key: string]: Json | undefined };
        Update: { [key: string]: Json | undefined };
      };
      banners: {
        Row: {
          id: string;
          title: string | null;
          image_url: string | null;
          link: string | null;
          order: number | null;
          active: boolean | null;
          type: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: { [key: string]: Json | undefined };
        Update: { [key: string]: Json | undefined };
      };
      external_banner: {
        Row: {
          id: string;
          bannerId: string | null;
          external_url: string | null;
          created_at: string;
        };
        Insert: { [key: string]: Json | undefined };
        Update: { [key: string]: Json | undefined };
      };
      sacs: {
        Row: {
          id: string;
          title: string | null;
          content: string | null;
          order: number | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: { [key: string]: Json | undefined };
        Update: { [key: string]: Json | undefined };
      };
      notifications: {
        Row: {
          id: string;
          userId: string | null;
          title: string | null;
          body: string | null;
          read: boolean | null;
          created_at: string;
        };
        Insert: { [key: string]: Json | undefined };
        Update: { [key: string]: Json | undefined };
      };
      settings: {
        Row: {
          id: string;
          key: string;
          value: string | null;
          description: string | null;
          updated_at: string | null;
        };
        Insert: { [key: string]: Json | undefined };
        Update: { [key: string]: Json | undefined };
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
}

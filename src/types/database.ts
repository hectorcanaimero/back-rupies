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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      rp_categories: {
        Row: {
          active: boolean
          icon_url: string | null
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          icon_url?: string | null
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          icon_url?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      rp_chat_messages: {
        Row: {
          chat_id: string
          content: string | null
          created_at: string | null
          id: string
          media_url: string | null
          message_type: string
          read_message: boolean
          sender_id: string
          sender_type: string
        }
        Insert: {
          chat_id: string
          content?: string | null
          created_at?: string | null
          id?: string
          media_url?: string | null
          message_type?: string
          read_message?: boolean
          sender_id: string
          sender_type: string
        }
        Update: {
          chat_id?: string
          content?: string | null
          created_at?: string | null
          id?: string
          media_url?: string | null
          message_type?: string
          read_message?: boolean
          sender_id?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "rp_chat_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "rp_chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rp_chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "rp_users"
            referencedColumns: ["id"]
          },
        ]
      }
      rp_chats: {
        Row: {
          contractor_id: string
          created_at: string | null
          id: string
          last_message_at: string | null
          lead_id: string | null
          prestador_id: string
          service_id: string | null
        }
        Insert: {
          contractor_id: string
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          lead_id?: string | null
          prestador_id: string
          service_id?: string | null
        }
        Update: {
          contractor_id?: string
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          lead_id?: string | null
          prestador_id?: string
          service_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rp_chats_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "rp_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rp_chats_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "rp_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rp_chats_prestador_id_fkey"
            columns: ["prestador_id"]
            isOneToOne: false
            referencedRelation: "rp_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rp_chats_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "rp_services"
            referencedColumns: ["id"]
          },
        ]
      }
      rp_credit_balances: {
        Row: {
          created_at: string | null
          credits_granted: number
          credits_remaining: number
          credits_used: number
          id: string
          kind: string
          period_end: string | null
          period_start: string
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_granted?: number
          credits_remaining?: number
          credits_used?: number
          id?: string
          kind?: string
          period_end?: string | null
          period_start: string
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_granted?: number
          credits_remaining?: number
          credits_used?: number
          id?: string
          kind?: string
          period_end?: string | null
          period_start?: string
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rp_credit_balances_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "rp_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rp_credit_balances_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "rp_view_subs"
            referencedColumns: ["subscription_id"]
          },
          {
            foreignKeyName: "rp_credit_balances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "rp_users"
            referencedColumns: ["id"]
          },
        ]
      }
      rp_credit_packs: {
        Row: {
          active: boolean
          created_at: string
          credits: number
          id: string
          name: string
          price_brl: number
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          credits: number
          id?: string
          name: string
          price_brl: number
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          credits?: number
          id?: string
          name?: string
          price_brl?: number
          sort_order?: number
        }
        Relationships: []
      }
      rp_credit_purchases: {
        Row: {
          asaas_payment_id: string
          balance_id: string | null
          bank_slip_url: string | null
          billing_type: string
          created_at: string
          credits: number
          due_date: string | null
          id: string
          invoice_url: string | null
          pack_id: string
          paid_at: string | null
          pix_qr_code: string | null
          pix_qr_code_image: string | null
          status: string
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          asaas_payment_id: string
          balance_id?: string | null
          bank_slip_url?: string | null
          billing_type: string
          created_at?: string
          credits: number
          due_date?: string | null
          id?: string
          invoice_url?: string | null
          pack_id: string
          paid_at?: string | null
          pix_qr_code?: string | null
          pix_qr_code_image?: string | null
          status?: string
          updated_at?: string
          user_id: string
          value: number
        }
        Update: {
          asaas_payment_id?: string
          balance_id?: string | null
          bank_slip_url?: string | null
          billing_type?: string
          created_at?: string
          credits?: number
          due_date?: string | null
          id?: string
          invoice_url?: string | null
          pack_id?: string
          paid_at?: string | null
          pix_qr_code?: string | null
          pix_qr_code_image?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "rp_credit_purchases_balance_id_fkey"
            columns: ["balance_id"]
            isOneToOne: false
            referencedRelation: "rp_credit_balances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rp_credit_purchases_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "rp_credit_packs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rp_credit_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "rp_users"
            referencedColumns: ["id"]
          },
        ]
      }
      rp_credit_transactions: {
        Row: {
          action_type: string
          amount: number
          balance_id: string | null
          created_at: string | null
          id: string
          reference_id: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          amount: number
          balance_id?: string | null
          created_at?: string | null
          id?: string
          reference_id?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          amount?: number
          balance_id?: string | null
          created_at?: string | null
          id?: string
          reference_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rp_credit_transactions_balance_id_fkey"
            columns: ["balance_id"]
            isOneToOne: false
            referencedRelation: "rp_credit_balances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rp_credit_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "rp_users"
            referencedColumns: ["id"]
          },
        ]
      }
      rp_lead_contact: {
        Row: {
          created_at: string | null
          id: string
          lead_id: string
          message: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lead_id: string
          message?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lead_id?: string
          message?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rp_lead_contact_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "rp_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rp_lead_contact_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "rp_users"
            referencedColumns: ["id"]
          },
        ]
      }
      rp_leads: {
        Row: {
          category_id: string | null
          cep: string | null
          city: string | null
          contato_duvida: string | null
          created_at: string | null
          description: string | null
          event_date: string | null
          expectativa: string | null
          id: string
          orcamento: number | null
          orcamento_faixa: string | null
          perfil_publico: string | null
          prazo_retorno: string | null
          qtd: number | null
          state: string | null
          status: string
          title: string
          type_fornecedor: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category_id?: string | null
          cep?: string | null
          city?: string | null
          contato_duvida?: string | null
          created_at?: string | null
          description?: string | null
          event_date?: string | null
          expectativa?: string | null
          id?: string
          orcamento?: number | null
          orcamento_faixa?: string | null
          perfil_publico?: string | null
          prazo_retorno?: string | null
          qtd?: number | null
          state?: string | null
          status?: string
          title: string
          type_fornecedor?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category_id?: string | null
          cep?: string | null
          city?: string | null
          contato_duvida?: string | null
          created_at?: string | null
          description?: string | null
          event_date?: string | null
          expectativa?: string | null
          id?: string
          orcamento?: number | null
          orcamento_faixa?: string | null
          perfil_publico?: string | null
          prazo_retorno?: string | null
          qtd?: number | null
          state?: string | null
          status?: string
          title?: string
          type_fornecedor?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rp_leads_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "rp_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rp_leads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "rp_users"
            referencedColumns: ["id"]
          },
        ]
      }
      rp_notifications: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          read: boolean
          reference_id: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          read?: boolean
          reference_id?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          read?: boolean
          reference_id?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rp_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "rp_users"
            referencedColumns: ["id"]
          },
        ]
      }
      rp_providers: {
        Row: {
          banner: string | null
          created_at: string
          email: string | null
          fb: string | null
          id: string
          ig: string | null
          logo: string | null
          name: string
          order: number
          phone: string | null
          status: boolean
          type: string | null
          updated_at: string | null
          wa: string | null
          web: string | null
        }
        Insert: {
          banner?: string | null
          created_at?: string
          email?: string | null
          fb?: string | null
          id?: string
          ig?: string | null
          logo?: string | null
          name: string
          order?: number
          phone?: string | null
          status?: boolean
          type?: string | null
          updated_at?: string | null
          wa?: string | null
          web?: string | null
        }
        Update: {
          banner?: string | null
          created_at?: string
          email?: string | null
          fb?: string | null
          id?: string
          ig?: string | null
          logo?: string | null
          name?: string
          order?: number
          phone?: string | null
          status?: boolean
          type?: string | null
          updated_at?: string | null
          wa?: string | null
          web?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rp_providers_type_fkey"
            columns: ["type"]
            isOneToOne: false
            referencedRelation: "rp_type_provider"
            referencedColumns: ["id"]
          },
        ]
      }
      rp_rating_message_options: {
        Row: {
          active: boolean
          created_at: string
          direction: string
          id: string
          sort_order: number
          text: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          direction: string
          id?: string
          sort_order?: number
          text: string
        }
        Update: {
          active?: boolean
          created_at?: string
          direction?: string
          id?: string
          sort_order?: number
          text?: string
        }
        Relationships: []
      }
      rp_services: {
        Row: {
          address: string | null
          candidated: number
          category_id: string | null
          cep: string | null
          city: string | null
          condition: string
          created_at: string | null
          description: string | null
          id: string
          images: string[] | null
          job_type: string
          lat: number | null
          lng: number | null
          price: number | null
          scheduled_at: string | null
          state: string | null
          time_estimate: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          candidated?: number
          category_id?: string | null
          cep?: string | null
          city?: string | null
          condition?: string
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          job_type?: string
          lat?: number | null
          lng?: number | null
          price?: number | null
          scheduled_at?: string | null
          state?: string | null
          time_estimate?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          candidated?: number
          category_id?: string | null
          cep?: string | null
          city?: string | null
          condition?: string
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          job_type?: string
          lat?: number | null
          lng?: number | null
          price?: number | null
          scheduled_at?: string | null
          state?: string | null
          time_estimate?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rp_services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "rp_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rp_services_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "rp_users"
            referencedColumns: ["id"]
          },
        ]
      }
      rp_services_candidated: {
        Row: {
          approved: boolean
          created_at: string | null
          description: string | null
          id: string
          prestador_marked_done_at: string | null
          service_id: string
          user_id: string
        }
        Insert: {
          approved?: boolean
          created_at?: string | null
          description?: string | null
          id?: string
          prestador_marked_done_at?: string | null
          service_id: string
          user_id: string
        }
        Update: {
          approved?: boolean
          created_at?: string | null
          description?: string | null
          id?: string
          prestador_marked_done_at?: string | null
          service_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rp_services_candidated_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "rp_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rp_services_candidated_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "rp_users"
            referencedColumns: ["id"]
          },
        ]
      }
      rp_services_rating: {
        Row: {
          contractor_comment: string | null
          contractor_id: string
          contractor_rating: number | null
          created_at: string | null
          id: string
          prestador_comment: string | null
          prestador_id: string
          prestador_rating: number | null
          service_id: string
          updated_at: string | null
        }
        Insert: {
          contractor_comment?: string | null
          contractor_id: string
          contractor_rating?: number | null
          created_at?: string | null
          id?: string
          prestador_comment?: string | null
          prestador_id: string
          prestador_rating?: number | null
          service_id: string
          updated_at?: string | null
        }
        Update: {
          contractor_comment?: string | null
          contractor_id?: string
          contractor_rating?: number | null
          created_at?: string | null
          id?: string
          prestador_comment?: string | null
          prestador_id?: string
          prestador_rating?: number | null
          service_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rp_services_rating_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "rp_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rp_services_rating_prestador_id_fkey"
            columns: ["prestador_id"]
            isOneToOne: false
            referencedRelation: "rp_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rp_services_rating_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: true
            referencedRelation: "rp_services"
            referencedColumns: ["id"]
          },
        ]
      }
      rp_services_skill: {
        Row: {
          category_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rp_services_skill_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "rp_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rp_services_skill_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "rp_users"
            referencedColumns: ["id"]
          },
        ]
      }
      rp_subscription_invoices: {
        Row: {
          asaas_payment_id: string
          bank_slip_url: string | null
          billing_type: string
          created_at: string
          due_date: string
          id: string
          invoice_url: string | null
          paid_at: string | null
          pix_qr_code: string | null
          pix_qr_code_image: string | null
          status: string
          subscription_id: string
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          asaas_payment_id: string
          bank_slip_url?: string | null
          billing_type: string
          created_at?: string
          due_date: string
          id?: string
          invoice_url?: string | null
          paid_at?: string | null
          pix_qr_code?: string | null
          pix_qr_code_image?: string | null
          status?: string
          subscription_id: string
          updated_at?: string
          user_id: string
          value: number
        }
        Update: {
          asaas_payment_id?: string
          bank_slip_url?: string | null
          billing_type?: string
          created_at?: string
          due_date?: string
          id?: string
          invoice_url?: string | null
          paid_at?: string | null
          pix_qr_code?: string | null
          pix_qr_code_image?: string | null
          status?: string
          subscription_id?: string
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "rp_subscription_invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "rp_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rp_subscription_invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "rp_view_subs"
            referencedColumns: ["subscription_id"]
          },
          {
            foreignKeyName: "rp_subscription_invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "rp_users"
            referencedColumns: ["id"]
          },
        ]
      }
      rp_subscription_plans: {
        Row: {
          active: boolean
          asaas_plan_id: string | null
          created_at: string | null
          credits_per_month: number
          description: string | null
          free_tier_expires_at: string | null
          id: string
          image1: string | null
          image2: string | null
          image3: string | null
          is_free: boolean
          is_unlimited: boolean
          max_contractors_contacted: number | null
          max_services_per_month: number | null
          name: string
          plan_type: string
          plan_version: number
          price_monthly: number | null
          price_yearly: number | null
        }
        Insert: {
          active?: boolean
          asaas_plan_id?: string | null
          created_at?: string | null
          credits_per_month?: number
          description?: string | null
          free_tier_expires_at?: string | null
          id?: string
          image1?: string | null
          image2?: string | null
          image3?: string | null
          is_free?: boolean
          is_unlimited?: boolean
          max_contractors_contacted?: number | null
          max_services_per_month?: number | null
          name: string
          plan_type: string
          plan_version?: number
          price_monthly?: number | null
          price_yearly?: number | null
        }
        Update: {
          active?: boolean
          asaas_plan_id?: string | null
          created_at?: string | null
          credits_per_month?: number
          description?: string | null
          free_tier_expires_at?: string | null
          id?: string
          image1?: string | null
          image2?: string | null
          image3?: string | null
          is_free?: boolean
          is_unlimited?: boolean
          max_contractors_contacted?: number | null
          max_services_per_month?: number | null
          name?: string
          plan_type?: string
          plan_version?: number
          price_monthly?: number | null
          price_yearly?: number | null
        }
        Relationships: []
      }
      rp_subscription_usage: {
        Row: {
          candidates_received: number
          contractors_contacted: number
          id: string
          period_end: string
          period_start: string
          services_created: number
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          candidates_received?: number
          contractors_contacted?: number
          id?: string
          period_end: string
          period_start: string
          services_created?: number
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          candidates_received?: number
          contractors_contacted?: number
          id?: string
          period_end?: string
          period_start?: string
          services_created?: number
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rp_subscription_usage_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "rp_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rp_subscription_usage_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "rp_view_subs"
            referencedColumns: ["subscription_id"]
          },
          {
            foreignKeyName: "rp_subscription_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "rp_users"
            referencedColumns: ["id"]
          },
        ]
      }
      rp_subscriptions: {
        Row: {
          asaas_customer_id: string | null
          asaas_subscription_id: string | null
          billing_cycle: string | null
          cancelled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          status: string
          trial_end: string | null
          trial_start: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          asaas_customer_id?: string | null
          asaas_subscription_id?: string | null
          billing_cycle?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          status?: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          asaas_customer_id?: string | null
          asaas_subscription_id?: string | null
          billing_cycle?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          status?: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rp_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "rp_subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rp_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "rp_users"
            referencedColumns: ["id"]
          },
        ]
      }
      rp_type_provider: {
        Row: {
          banner: string | null
          category: string | null
          created_at: string
          icon: string | null
          id: string
          name: string | null
          order: number
          status: boolean
          updated_at: string | null
          url: string | null
        }
        Insert: {
          banner?: string | null
          category?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string | null
          order?: number
          status?: boolean
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          banner?: string | null
          category?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string | null
          order?: number
          status?: boolean
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      rp_user_settings: {
        Row: {
          created_at: string
          language: string
          notif_credit_low: boolean
          notif_marketing: boolean
          notif_new_candidate: boolean
          notif_new_lead: boolean
          notif_new_message: boolean
          show_email: boolean
          show_phone: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          language?: string
          notif_credit_low?: boolean
          notif_marketing?: boolean
          notif_new_candidate?: boolean
          notif_new_lead?: boolean
          notif_new_message?: boolean
          show_email?: boolean
          show_phone?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          language?: string
          notif_credit_low?: boolean
          notif_marketing?: boolean
          notif_new_candidate?: boolean
          notif_new_lead?: boolean
          notif_new_message?: boolean
          show_email?: boolean
          show_phone?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rp_user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "rp_users"
            referencedColumns: ["id"]
          },
        ]
      }
      rp_users: {
        Row: {
          asaas_customer_id: string | null
          auth_id: string | null
          avatar_url: string | null
          ban: boolean
          cep: string | null
          chave_pix: string | null
          city: string | null
          complement: string | null
          cpf_cnpj: string | null
          created_at: string | null
          email: string
          end_register: boolean
          fcm_token: string | null
          id: string
          is_contractor: boolean
          lat: number | null
          lng: number | null
          name: string
          name_contractor: string | null
          neighborhood: string | null
          profile_completed: boolean
          rating: number | null
          role: Database["public"]["Enums"]["app_role"]
          state: string | null
          status: boolean
          street: string | null
          street_number: string | null
          type_company: string | null
          updated_at: string | null
        }
        Insert: {
          asaas_customer_id?: string | null
          auth_id?: string | null
          avatar_url?: string | null
          ban?: boolean
          cep?: string | null
          chave_pix?: string | null
          city?: string | null
          complement?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email: string
          end_register?: boolean
          fcm_token?: string | null
          id?: string
          is_contractor?: boolean
          lat?: number | null
          lng?: number | null
          name: string
          name_contractor?: string | null
          neighborhood?: string | null
          profile_completed?: boolean
          rating?: number | null
          role: Database["public"]["Enums"]["app_role"]
          state?: string | null
          status?: boolean
          street?: string | null
          street_number?: string | null
          type_company?: string | null
          updated_at?: string | null
        }
        Update: {
          asaas_customer_id?: string | null
          auth_id?: string | null
          avatar_url?: string | null
          ban?: boolean
          cep?: string | null
          chave_pix?: string | null
          city?: string | null
          complement?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string
          end_register?: boolean
          fcm_token?: string | null
          id?: string
          is_contractor?: boolean
          lat?: number | null
          lng?: number | null
          name?: string
          name_contractor?: string | null
          neighborhood?: string | null
          profile_completed?: boolean
          rating?: number | null
          role?: Database["public"]["Enums"]["app_role"]
          state?: string | null
          status?: boolean
          street?: string | null
          street_number?: string | null
          type_company?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rp_users_portfolio: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          images: string[]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rp_users_portfolio_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "rp_users"
            referencedColumns: ["id"]
          },
        ]
      }
      rp_webhook_events: {
        Row: {
          event_id: string
          event_type: string
          payload: Json
          processed_at: string | null
          received_at: string
        }
        Insert: {
          event_id: string
          event_type: string
          payload: Json
          processed_at?: string | null
          received_at?: string
        }
        Update: {
          event_id?: string
          event_type?: string
          payload?: Json
          processed_at?: string | null
          received_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      rp_services_candidated_v_compat: {
        Row: {
          approved: boolean | null
          aproved: boolean | null
          created_at: string | null
          description: string | null
          id: string | null
          prestador_marked_done_at: string | null
          service_id: string | null
          user_id: string | null
        }
        Insert: {
          approved?: boolean | null
          aproved?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          prestador_marked_done_at?: string | null
          service_id?: string | null
          user_id?: string | null
        }
        Update: {
          approved?: boolean | null
          aproved?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          prestador_marked_done_at?: string | null
          service_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rp_services_candidated_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "rp_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rp_services_candidated_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "rp_users"
            referencedColumns: ["id"]
          },
        ]
      }
      rp_view_subs: {
        Row: {
          asaas_subscription_id: string | null
          credits_granted: number | null
          credits_remaining: number | null
          credits_used: number | null
          current_period_end: string | null
          is_free: boolean | null
          is_unlimited: boolean | null
          plan_id: string | null
          plan_type: string | null
          status: string | null
          subscription_id: string | null
          trial_end: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rp_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "rp_subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rp_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "rp_users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      rp_activate_paid_plan: {
        Args: { p_invoice_id: string; p_paid_at?: string }
        Returns: Json
      }
      rp_activate_plan: { Args: { p_plan_id: string }; Returns: string }
      rp_available_credits_mao: { Args: { p_user_id: string }; Returns: number }
      rp_base64url: { Args: { p_data: string }; Returns: string }
      rp_can_read_chat_media: { Args: { p_name: string }; Returns: boolean }
      rp_can_write_chat_media: { Args: { p_name: string }; Returns: boolean }
      rp_claim_app_role: {
        Args: { p_role: Database["public"]["Enums"]["app_role"] }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      rp_close_plan_balances: {
        Args: { p_at?: string; p_user_id: string }
        Returns: number
      }
      rp_consume_credit: {
        Args: { p_action_type: string; p_reference_id: string }
        Returns: Json
      }
      rp_current_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      rp_current_user_id: { Args: never; Returns: string }
      rp_current_week_bounds: {
        Args: never
        Returns: {
          week_end: string
          week_start: string
        }[]
      }
      rp_enqueue_push: {
        Args: {
          p_body: string
          p_data?: Json
          p_title: string
          p_user_id: string
        }
        Returns: undefined
      }
      rp_ensure_weekly_credits_mao: {
        Args: { p_user_id: string }
        Returns: string
      }
      rp_grant_purchase_credits: {
        Args: { p_paid_at?: string; p_purchase_id: string }
        Returns: Json
      }
      rp_is_chat_participant: { Args: { p_chat_id: string }; Returns: boolean }
      rp_prestador_mark_service_done: {
        Args: { p_service_id: string }
        Returns: string
      }
      rp_sign_webhook_jwt: { Args: { p_payload: Json }; Returns: string }
      rp_spend_credit_mao: {
        Args: {
          p_action_type: string
          p_reference_id?: string
          p_user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "empresa" | "prestador" | "admin"
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
      app_role: ["empresa", "prestador", "admin"],
    },
  },
} as const

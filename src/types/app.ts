import type { Database } from "./database";

// Convenience aliases
export type User = Database["public"]["Tables"]["rp_users"]["Row"];
export type Service = Database["public"]["Tables"]["rp_services"]["Row"];
export type ServiceCandidated = Database["public"]["Tables"]["rp_services_candidated"]["Row"];
export type ServiceRating = Database["public"]["Tables"]["rp_services_rating"]["Row"];
export type Subscription = Database["public"]["Tables"]["rp_subscriptions"]["Row"];
export type SubscriptionPlan = Database["public"]["Tables"]["rp_subscription_plans"]["Row"];
export type CreditBalance = Database["public"]["Tables"]["rp_credit_balances"]["Row"];
export type Category = Database["public"]["Tables"]["rp_categories"]["Row"];

// KPI types for dashboard
export interface KpiCard {
  title: string;
  value: string | number;
  change?: number; // percentage change
  trend?: "up" | "down" | "neutral";
}

// Subscription with joined user + plan (used in list page)
export interface SubscriptionWithRelations extends Subscription {
  users: Pick<User, "id" | "name" | "email"> | null;
  subscription_plans: Pick<SubscriptionPlan, "id" | "name" | "price_monthly" | "price_yearly" | "is_unlimited"> | null;
}

// CreditBalance with joined user (used in list page)
export interface CreditBalanceWithUser extends CreditBalance {
  users: Pick<User, "id" | "name" | "email"> | null;
}

// Subscription usage for current period
export type SubscriptionUsage = Database["public"]["Tables"]["rp_subscription_usage"]["Row"];

export type Lead = Database["public"]["Tables"]["rp_leads"]["Row"];
export type LeadContact = Database["public"]["Tables"]["rp_lead_contact"]["Row"];
export type Chat = Database["public"]["Tables"]["rp_chats"]["Row"];
export type ChatMessage = Database["public"]["Tables"]["rp_chat_messages"]["Row"];
export type TypeProvider = Database["public"]["Tables"]["rp_type_provider"]["Row"];
export type Provider = Database["public"]["Tables"]["rp_providers"]["Row"];
export type Notification = Database["public"]["Tables"]["rp_notifications"]["Row"];

// Lead with joined user (empresa)
export interface LeadWithUser extends Lead {
  users: Pick<User, "id" | "name" | "email"> | null;
}

// Chat with joined participants and service/lead info
export interface ChatWithRelations extends Chat {
  userA: Pick<User, "id" | "name" | "email"> | null;
  userB: Pick<User, "id" | "name" | "email"> | null;
  services: Pick<Service, "id" | "title"> | null;
}

import type { Database } from "./database";

// Convenience aliases
export type AdminUser = Database["public"]["Tables"]["admin_users"]["Row"];
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Service = Database["public"]["Tables"]["services"]["Row"];
export type ServiceCandidated = Database["public"]["Tables"]["services_candidated"]["Row"];
export type ServiceRating = Database["public"]["Tables"]["services_rating"]["Row"];
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
export type SubscriptionPlan = Database["public"]["Tables"]["subscription_plans"]["Row"];
export type CreditBalance = Database["public"]["Tables"]["credit_balances"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];

// KPI types for dashboard
export interface KpiCard {
  title: string;
  value: string | number;
  change?: number; // percentage change
  trend?: "up" | "down" | "neutral";
}

// Subscription with joined user + plan (used in list page)
export interface SubscriptionWithRelations extends Subscription {
  users: Pick<User, "id" | "display_name" | "email"> | null;
  subscription_plans: Pick<SubscriptionPlan, "id" | "name" | "price_monthly" | "price_yearly"> | null;
}

// CreditBalance with joined user (used in list page)
export interface CreditBalanceWithUser extends CreditBalance {
  users: Pick<User, "id" | "display_name" | "email"> | null;
}

// Subscription usage for current period
export interface SubscriptionUsage {
  id: string;
  subscription_id: string;
  period_start: string;
  period_end: string;
  services_created: number | null;
  contractors_contacted: number | null;
  candidates_received: number | null;
  updated_at: string | null;
}

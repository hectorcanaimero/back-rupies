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

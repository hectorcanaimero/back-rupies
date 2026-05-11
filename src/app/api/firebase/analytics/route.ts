// src/app/api/firebase/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DailyActiveUser {
  date: string; // "DD/MM"
  users: number;
}

export interface TopEvent {
  name: string;
  count: number;
}

export interface AnalyticsResponse {
  dau: number;
  mau: number;
  dauMauRatio: number; // percentage (0–100)
  avgSessionDurationSec: number;
  trend: DailyActiveUser[]; // 30-day active user trend
  topEvents: TopEvent[]; // top 10 events
  isMock: boolean;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

function generateTrend(days: number): DailyActiveUser[] {
  const result: DailyActiveUser[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    result.push({
      date: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      users: Math.floor(Math.random() * 300) + 400,
    });
  }
  return result;
}

const MOCK_DATA: AnalyticsResponse = {
  dau: 612,
  mau: 4891,
  dauMauRatio: 12.5,
  avgSessionDurationSec: 284,
  trend: generateTrend(30),
  topEvents: [
    { name: "leads_view", count: 18420 },
    { name: "service_create", count: 9821 },
    { name: "candidature_submit", count: 7234 },
    { name: "profile_view", count: 6891 },
    { name: "chat_open", count: 5432 },
    { name: "subscription_view", count: 4120 },
    { name: "search_services", count: 3892 },
    { name: "rating_submit", count: 2341 },
    { name: "credits_view", count: 1892 },
    { name: "notification_open", count: 1234 },
  ],
  isMock: true,
};

// ─── GA4 real fetch (attempt) ─────────────────────────────────────────────────

async function fetchFromGA4(
  propertyId: string,
  days: number
): Promise<AnalyticsResponse | null> {
  try {
    // @google-analytics/data BetaAnalyticsDataClient
    // Dynamic import to avoid crash when package isn't installed
    const { BetaAnalyticsDataClient } = await import("@google-analytics/data");

    const client = new BetaAnalyticsDataClient({
      credentials: {
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
    });

    const dateRange = { startDate: `${days}daysAgo`, endDate: "today" };

    // Active users trend (daily)
    const [trendResponse] = await client.runReport({
      property: propertyId,
      dateRanges: [dateRange],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });

    // DAU = today's active users
    const [dauResponse] = await client.runReport({
      property: propertyId,
      dateRanges: [{ startDate: "today", endDate: "today" }],
      metrics: [{ name: "activeUsers" }],
    });

    // MAU = 30-day active users
    const [mauResponse] = await client.runReport({
      property: propertyId,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      metrics: [{ name: "activeUsers" }],
    });

    // Avg session duration
    const [sessionResponse] = await client.runReport({
      property: propertyId,
      dateRanges: [dateRange],
      metrics: [{ name: "averageSessionDuration" }],
    });

    // Top events
    const [eventsResponse] = await client.runReport({
      property: propertyId,
      dateRanges: [dateRange],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 10,
    });

    const trend: DailyActiveUser[] = (trendResponse.rows ?? []).map((row) => {
      const rawDate = row.dimensionValues?.[0]?.value ?? ""; // "20260501"
      const y = rawDate.slice(0, 4);
      const m = rawDate.slice(4, 6);
      const d = rawDate.slice(6, 8);
      const dateObj = new Date(`${y}-${m}-${d}`);
      return {
        date: dateObj.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        }),
        users: parseInt(row.metricValues?.[0]?.value ?? "0", 10),
      };
    });

    const dau = parseInt(
      dauResponse.rows?.[0]?.metricValues?.[0]?.value ?? "0",
      10
    );
    const mau = parseInt(
      mauResponse.rows?.[0]?.metricValues?.[0]?.value ?? "0",
      10
    );
    const avgSessionDurationSec = Math.round(
      parseFloat(sessionResponse.rows?.[0]?.metricValues?.[0]?.value ?? "0")
    );

    const topEvents: TopEvent[] = (eventsResponse.rows ?? []).map((row) => ({
      name: row.dimensionValues?.[0]?.value ?? "unknown",
      count: parseInt(row.metricValues?.[0]?.value ?? "0", 10),
    }));

    return {
      dau,
      mau,
      dauMauRatio: mau > 0 ? Math.round((dau / mau) * 1000) / 10 : 0,
      avgSessionDurationSec,
      trend,
      topEvents,
      isMock: false,
    };
  } catch (err) {
    console.warn("[Analytics] GA4 fetch failed, using mock:", err);
    return null;
  }
}

// ─── GET /api/firebase/analytics ─────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = parseInt(searchParams.get("period") ?? "30", 10);
  const days = [7, 30, 90].includes(period) ? period : 30;

  const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;

  let result: AnalyticsResponse | null = null;

  if (propertyId) {
    result = await fetchFromGA4(propertyId, days);
  }

  // Fallback to mock
  if (!result) {
    result = { ...MOCK_DATA, trend: generateTrend(days), isMock: true };
  }

  return NextResponse.json(result);
}

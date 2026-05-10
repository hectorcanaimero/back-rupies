// src/app/api/firebase/performance/route.ts
import { NextRequest, NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PerformanceTrace {
  name: string;
  p50: number; // milliseconds
  p90: number;
  p99: number;
  sampleCount: number;
  app: "empresas" | "profissionais";
}

export interface NetworkRequest {
  url: string;
  avgLatency: number; // milliseconds
  successRate: number; // 0–100
  sampleCount: number;
  app: "empresas" | "profissionais";
}

export interface PerformanceResponse {
  traces: PerformanceTrace[];
  networkRequests: NetworkRequest[];
  avgResponseTime: number;
  p99Latency: number;
  successRate: number;
  isMock: boolean;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
// NOTE: Firebase Performance Monitoring's public REST API is limited.
// For production-grade data, enable BigQuery linking in Firebase Console →
//   Performance Monitoring → BigQuery export.
// Table: `firebase-public-project.firebase_performance.PERFORMANCE_*`
// See: https://firebase.google.com/docs/perf-mon/get-started

const MOCK_TRACES: PerformanceTrace[] = [
  { name: "_app_start", p50: 1240, p90: 2180, p99: 3890, sampleCount: 4521, app: "empresas" },
  { name: "leads_list_load", p50: 890, p90: 1540, p99: 2900, sampleCount: 2341, app: "empresas" },
  { name: "service_detail_load", p50: 450, p90: 920, p99: 1800, sampleCount: 3102, app: "empresas" },
  { name: "_app_start", p50: 1380, p90: 2340, p99: 4100, sampleCount: 3890, app: "profissionais" },
  { name: "profile_load", p50: 320, p90: 680, p99: 1240, sampleCount: 5431, app: "profissionais" },
  { name: "candidature_submit", p50: 280, p90: 590, p99: 1100, sampleCount: 1892, app: "profissionais" },
  { name: "chat_open", p50: 190, p90: 410, p99: 890, sampleCount: 8920, app: "empresas" },
  { name: "subscription_checkout", p50: 2100, p90: 3890, p99: 6200, sampleCount: 423, app: "empresas" },
];

const MOCK_NETWORK: NetworkRequest[] = [
  { url: "ejnzgjczritznohpdnxl.supabase.co/rest/v1/services", avgLatency: 230, successRate: 99.2, sampleCount: 12450, app: "empresas" },
  { url: "ejnzgjczritznohpdnxl.supabase.co/rest/v1/leads", avgLatency: 198, successRate: 98.7, sampleCount: 8920, app: "empresas" },
  { url: "ejnzgjczritznohpdnxl.supabase.co/realtime/v1/websocket", avgLatency: 45, successRate: 97.1, sampleCount: 34200, app: "profissionais" },
  { url: "storage.googleapis.com/rupies-assets", avgLatency: 380, successRate: 99.8, sampleCount: 6780, app: "profissionais" },
  { url: "fcm.googleapis.com/v1/projects/rupies-brasil/messages", avgLatency: 120, successRate: 98.4, sampleCount: 2340, app: "empresas" },
];

// ─── GET /api/firebase/performance ───────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const app = searchParams.get("app");

  let traces = [...MOCK_TRACES];
  let networkRequests = [...MOCK_NETWORK];

  if (app === "empresas" || app === "profissionais") {
    traces = traces.filter((t) => t.app === app);
    networkRequests = networkRequests.filter((n) => n.app === app);
  }

  // Sort traces by p90 desc (slowest first)
  traces.sort((a, b) => b.p90 - a.p90);

  const avgResponseTime =
    traces.length > 0
      ? Math.round(traces.reduce((s, t) => s + t.p50, 0) / traces.length)
      : 0;

  const p99Latency = traces.length > 0 ? Math.max(...traces.map((t) => t.p99)) : 0;

  const successRate =
    networkRequests.length > 0
      ? Math.round(
          (networkRequests.reduce((s, n) => s + n.successRate, 0) /
            networkRequests.length) *
            10
        ) / 10
      : 0;

  const response: PerformanceResponse = {
    traces,
    networkRequests,
    avgResponseTime,
    p99Latency,
    successRate,
    isMock: true,
  };

  return NextResponse.json(response);
}

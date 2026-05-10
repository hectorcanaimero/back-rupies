// src/app/api/firebase/crashlytics/route.ts
import { NextRequest, NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CrashlyticsIssue {
  id: string;
  title: string;
  subtitle: string;
  count: number;
  affectedUsers: number;
  firstSeen: string;
  lastSeen: string;
  appVersion: string;
  app: "empresas" | "profissionais";
}

export interface CrashlyticsDay {
  date: string; // "DD/MM"
  crashes: number;
}

export interface CrashlyticsResponse {
  issues: CrashlyticsIssue[];
  trend: CrashlyticsDay[];
  totalCrashes: number;
  affectedUsers: number;
  isMock: boolean;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
// NOTE: Real implementation requires BigQuery export from Crashlytics.
// Firebase does not provide a direct REST API for fetching crash issues.
// Setup: Firebase Console → Crashlytics → BigQuery linking →
//   query table `firebase-public-project.crashlytics.CRASHLYTICS_*`
// See: https://firebase.google.com/docs/crashlytics/bigquery-export

function generateTrend(): CrashlyticsDay[] {
  const days: CrashlyticsDay[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      crashes: Math.floor(Math.random() * 40) + 5,
    });
  }
  return days;
}

const MOCK_ISSUES: CrashlyticsIssue[] = [
  {
    id: "issue_001",
    title: "NullPointerException in LeadsListFragment",
    subtitle: "java.lang.NullPointerException: Attempt to invoke virtual method",
    count: 247,
    affectedUsers: 89,
    firstSeen: "2026-04-15T10:23:00Z",
    lastSeen: "2026-05-09T18:45:00Z",
    appVersion: "2.4.1",
    app: "empresas",
  },
  {
    id: "issue_002",
    title: "Fatal Exception: FlutterError",
    subtitle: "RenderBox was not laid out: RenderSemanticsAnnotations",
    count: 183,
    affectedUsers: 61,
    firstSeen: "2026-04-22T08:11:00Z",
    lastSeen: "2026-05-10T09:30:00Z",
    appVersion: "2.4.0",
    app: "profissionais",
  },
  {
    id: "issue_003",
    title: "PlatformException: Failed to decode bitmap",
    subtitle: "android.graphics.BitmapFactory — null image URL from CDN",
    count: 142,
    affectedUsers: 54,
    firstSeen: "2026-05-01T14:00:00Z",
    lastSeen: "2026-05-10T11:20:00Z",
    appVersion: "2.4.1",
    app: "empresas",
  },
  {
    id: "issue_004",
    title: "SocketException: Connection reset by peer",
    subtitle: "dart:io — socket connection to Supabase realtime",
    count: 98,
    affectedUsers: 45,
    firstSeen: "2026-05-03T07:00:00Z",
    lastSeen: "2026-05-10T10:15:00Z",
    appVersion: "2.4.1",
    app: "profissionais",
  },
  {
    id: "issue_005",
    title: "StateError: Bad state: Stream already listened to",
    subtitle: "dart:async — realtime subscription not properly disposed",
    count: 76,
    affectedUsers: 38,
    firstSeen: "2026-04-28T16:45:00Z",
    lastSeen: "2026-05-08T22:10:00Z",
    appVersion: "2.3.9",
    app: "empresas",
  },
  {
    id: "issue_006",
    title: "Firebase Messaging: Unhandled token refresh",
    subtitle: "com.google.firebase.messaging — background isolate crash",
    count: 54,
    affectedUsers: 29,
    firstSeen: "2026-05-05T09:30:00Z",
    lastSeen: "2026-05-10T08:00:00Z",
    appVersion: "2.4.1",
    app: "profissionais",
  },
];

// ─── GET /api/firebase/crashlytics ───────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const app = searchParams.get("app"); // "empresas" | "profissionais" | null
  const version = searchParams.get("version"); // e.g. "2.4.1" | null

  let issues = [...MOCK_ISSUES];

  if (app === "empresas" || app === "profissionais") {
    issues = issues.filter((i) => i.app === app);
  }
  if (version) {
    issues = issues.filter((i) => i.appVersion === version);
  }

  const totalCrashes = issues.reduce((s, i) => s + i.count, 0);
  const affectedUsers = issues.reduce((s, i) => s + i.affectedUsers, 0);

  const response: CrashlyticsResponse = {
    issues,
    trend: generateTrend(),
    totalCrashes,
    affectedUsers,
    isMock: true,
  };

  return NextResponse.json(response);
}

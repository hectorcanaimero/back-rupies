# Push Notifications Enhancements — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the push notifications page with image upload to Supabase Storage, scheduled sending via a `scheduled_pushes` table, and multi-user autocomplete targeting from `public.users`.

**Architecture:** The image upload uses a new API route that uploads to a `push-images` Supabase Storage bucket and returns a public URL. Scheduling stores the full push payload in a `scheduled_pushes` table with a `scheduled_at` timestamp; a Supabase pg_cron job runs every minute to fire pending pushes via a database function that calls the FCM endpoint. The multi-user autocomplete adds a new target type `"users"` with a debounced search against `public.users` (by `display_name` or `email`) and sends individual FCM messages per selected user's `fcm_token`.

**Tech Stack:** Next.js 16, Supabase (Storage, Database, pg_cron), Firebase Admin (FCM), React 19, Zod, Tailwind CSS 4, date-fns

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/app/api/storage/upload/route.ts` | NEW — handles file upload to Supabase Storage |
| `src/app/api/users/search/route.ts` | NEW — searches `public.users` by name/email |
| `src/app/api/firebase/fcm/route.ts` | MODIFY — support `users` target type (multiple tokens) |
| `src/app/(dashboard)/push/page.tsx` | MODIFY — add upload UI, scheduling, multi-user autocomplete |
| `src/app/(dashboard)/push/components/image-upload.tsx` | NEW — image upload component |
| `src/app/(dashboard)/push/components/user-autocomplete.tsx` | NEW — multi-user search + select component |
| `src/app/(dashboard)/push/components/schedule-picker.tsx` | NEW — date/time picker for scheduling |
| `supabase/migrations/001_scheduled_pushes.sql` | NEW — table + pg_cron setup |

---

## Task 1: Supabase Storage — API Route for Image Upload

**Files:**
- Create: `src/app/api/storage/upload/route.ts`

- [ ] **Step 1: Create the upload API route**

```typescript
// src/app/api/storage/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "push-images";
const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo não permitido. Use PNG, JPEG, WebP ou GIF" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo 2MB" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const ext = file.name.split(".").pop() ?? "png";
    const fileName = `${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[Storage] Upload error:", uploadError.message);
      return NextResponse.json(
        { error: "Falha no upload", detail: uploadError.message },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[Storage] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create the Supabase Storage bucket**

Using the Supabase MCP tool or dashboard, create a public bucket named `push-images`:

```sql
-- Run via Supabase SQL editor or migration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'push-images',
  'push-images',
  true,
  2097152,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
);
```

- [ ] **Step 3: Test manually with curl**

```bash
curl -X POST http://localhost:3000/api/storage/upload \
  -F "file=@test-image.png"
# Expected: { "url": "https://ejnzgjczritznohpdnxl.supabase.co/storage/v1/object/public/push-images/<uuid>.png" }
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/storage/upload/route.ts
git commit -m "feat(push): add image upload API route for Supabase Storage"
```

---

## Task 2: Image Upload UI Component

**Files:**
- Create: `src/app/(dashboard)/push/components/image-upload.tsx`

- [ ] **Step 1: Create the image upload component**

```tsx
// src/app/(dashboard)/push/components/image-upload.tsx
"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? "Erro no upload");
      }

      onChange(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no upload");
    } finally {
      setUploading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className="space-y-1.5">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled || uploading}
      />

      {value ? (
        <div className="relative rounded-md border border-border overflow-hidden">
          <img
            src={value}
            alt="Preview"
            className="h-32 w-full object-cover"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute top-1 right-1 h-6 w-6 p-0 bg-background/80 hover:bg-background"
            onClick={() => onChange("")}
            disabled={disabled}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          disabled={disabled || uploading}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border p-6 text-muted-foreground hover:border-ring hover:bg-accent/50 transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <ImageIcon className="h-6 w-6" />
          )}
          <span className="text-xs">
            {uploading ? "Enviando..." : "Clique ou arraste uma imagem (max 2MB)"}
          </span>
        </button>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(dashboard)/push/components/image-upload.tsx
git commit -m "feat(push): add ImageUpload component with drag-and-drop"
```

---

## Task 3: User Search API Route

**Files:**
- Create: `src/app/api/users/search/route.ts`

- [ ] **Step 1: Create the search endpoint**

```typescript
// src/app/api/users/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ users: [] });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("users")
    .select("id, display_name, email, photo_url, fcm_token")
    .or(`display_name.ilike.%${query}%,email.ilike.%${query}%`)
    .not("fcm_token", "is", null)
    .limit(20);

  if (error) {
    console.error("[Users Search]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    users: data.map((u) => ({
      id: u.id,
      displayName: u.display_name,
      email: u.email,
      photoUrl: u.photo_url,
      fcmToken: u.fcm_token,
    })),
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/users/search/route.ts
git commit -m "feat(push): add user search API endpoint for autocomplete"
```

---

## Task 4: Multi-User Autocomplete Component

**Files:**
- Create: `src/app/(dashboard)/push/components/user-autocomplete.tsx`

- [ ] **Step 1: Create the autocomplete component**

```tsx
// src/app/(dashboard)/push/components/user-autocomplete.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { X, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface UserOption {
  id: string;
  displayName: string | null;
  email: string | null;
  photoUrl: string | null;
  fcmToken: string;
}

interface UserAutocompleteProps {
  selected: UserOption[];
  onChange: (users: UserOption[]) => void;
  disabled?: boolean;
}

export function UserAutocomplete({ selected, onChange, disabled }: UserAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        const filtered = (json.users ?? []).filter(
          (u: UserOption) => !selected.some((s) => s.id === u.id)
        );
        setResults(filtered);
        setOpen(filtered.length > 0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query, selected]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function addUser(user: UserOption) {
    onChange([...selected, user]);
    setQuery("");
    setOpen(false);
  }

  function removeUser(id: string) {
    onChange(selected.filter((u) => u.id !== id));
  }

  return (
    <div ref={containerRef} className="relative space-y-2">
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((user) => (
            <Badge key={user.id} variant="secondary" className="gap-1 pr-1">
              <span className="max-w-32 truncate text-xs">
                {user.displayName ?? user.email ?? user.id.slice(0, 8)}
              </span>
              <button
                type="button"
                onClick={() => removeUser(user.id)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="pl-8"
          disabled={disabled}
        />
        {loading && (
          <Loader2 className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Dropdown results */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md max-h-48 overflow-y-auto">
          {results.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => addUser(user)}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-accent transition-colors"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={user.photoUrl ?? undefined} />
                <AvatarFallback className="text-[10px]">
                  {(user.displayName ?? user.email ?? "?")[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {user.displayName ?? "Sem nome"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(dashboard)/push/components/user-autocomplete.tsx
git commit -m "feat(push): add multi-user autocomplete component"
```

---

## Task 5: Schedule Picker Component

**Files:**
- Create: `src/app/(dashboard)/push/components/schedule-picker.tsx`

- [ ] **Step 1: Create the schedule picker component**

```tsx
// src/app/(dashboard)/push/components/schedule-picker.tsx
"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Clock } from "lucide-react";

interface SchedulePickerProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  scheduledAt: string; // ISO datetime-local value
  onScheduledAtChange: (value: string) => void;
  disabled?: boolean;
}

export function SchedulePicker({
  enabled,
  onEnabledChange,
  scheduledAt,
  onScheduledAtChange,
  disabled,
}: SchedulePickerProps) {
  // Minimum is 5 minutes from now
  const minDate = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5" />
          Agendar envio
        </Label>
        <Switch
          checked={enabled}
          onCheckedChange={onEnabledChange}
          disabled={disabled}
        />
      </div>

      {enabled && (
        <div className="space-y-1.5">
          <Input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => onScheduledAtChange(e.target.value)}
            min={minDate}
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground">
            A notificação será enviada automaticamente na data e hora selecionada
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(dashboard)/push/components/schedule-picker.tsx
git commit -m "feat(push): add SchedulePicker component"
```

---

## Task 6: Scheduled Pushes — Database Migration

**Files:**
- Create: `supabase/migrations/001_scheduled_pushes.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- supabase/migrations/001_scheduled_pushes.sql

-- Table to store scheduled push notifications
CREATE TABLE IF NOT EXISTS public.scheduled_pushes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  data_payload JSONB,
  target_type TEXT NOT NULL CHECK (target_type IN ('all', 'topic', 'token', 'users')),
  target_value TEXT, -- topic name, token, or null for 'all'
  target_users JSONB, -- array of { id, fcmToken } for 'users' type
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.admin_users(id)
);

-- Index for the cron job query
CREATE INDEX idx_scheduled_pushes_pending
  ON public.scheduled_pushes (scheduled_at)
  WHERE status = 'pending';

-- Enable pg_cron extension (if not already)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Function that processes pending pushes
-- This marks them as 'sent' so the app can fire them via FCM
-- The actual FCM call is done by an Edge Function or webhook
CREATE OR REPLACE FUNCTION process_scheduled_pushes()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  push_record RECORD;
BEGIN
  FOR push_record IN
    SELECT id FROM public.scheduled_pushes
    WHERE status = 'pending' AND scheduled_at <= now()
    FOR UPDATE SKIP LOCKED
  LOOP
    UPDATE public.scheduled_pushes
    SET status = 'sent', sent_at = now()
    WHERE id = push_record.id;
  END LOOP;
END;
$$;

-- Cron job: every minute, process pending pushes
SELECT cron.schedule(
  'process-scheduled-pushes',
  '* * * * *',
  $$SELECT process_scheduled_pushes()$$
);
```

- [ ] **Step 2: Apply migration via Supabase MCP or SQL editor**

Run the SQL above in Supabase.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/001_scheduled_pushes.sql
git commit -m "feat(push): add scheduled_pushes table and pg_cron job"
```

---

## Task 7: Schedule Push — API Route

**Files:**
- Create: `src/app/api/push/schedule/route.ts`

- [ ] **Step 1: Create the schedule API route**

```typescript
// src/app/api/push/schedule/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const ScheduleSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  imageUrl: z.string().url().optional().or(z.literal("")),
  dataPayload: z.record(z.string()).optional(),
  targetType: z.enum(["all", "topic", "token", "users"]),
  targetValue: z.string().optional(),
  targetUsers: z.array(z.object({
    id: z.string(),
    fcmToken: z.string(),
  })).optional(),
  scheduledAt: z.string().datetime(),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = ScheduleSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { title, body, imageUrl, dataPayload, targetType, targetValue, targetUsers, scheduledAt } = parsed.data;

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("scheduled_pushes")
      .insert({
        title,
        body,
        image_url: imageUrl || null,
        data_payload: dataPayload ?? null,
        target_type: targetType,
        target_value: targetValue ?? null,
        target_users: targetUsers ?? null,
        scheduled_at: scheduledAt,
        status: "pending",
      })
      .select("id, scheduled_at")
      .single();

    if (error) {
      console.error("[Schedule]", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      scheduledAt: data.scheduled_at,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/push/schedule/route.ts
git commit -m "feat(push): add schedule push API route"
```

---

## Task 8: Update FCM Route — Support Multi-User Target

**Files:**
- Modify: `src/app/api/firebase/fcm/route.ts`

- [ ] **Step 1: Update the FCM route to handle `users` target type**

Replace the entire file with:

```typescript
// src/app/api/firebase/fcm/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Notification } from "firebase-admin/messaging";

async function getMessaging() {
  const { messaging } = await import("@/lib/firebase/admin");
  return messaging;
}

// ─── Validation schema ────────────────────────────────────────────────────────

const FcmTargetSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("topic"), value: z.string().min(1) }),
  z.object({ type: z.literal("token"), value: z.string().min(1) }),
  z.object({ type: z.literal("all"), value: z.string().default("all") }),
  z.object({
    type: z.literal("users"),
    tokens: z.array(z.string().min(1)).min(1),
  }),
]);

const FcmBodySchema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  body: z.string().min(1, "Corpo obrigatório"),
  imageUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  data: z.record(z.string()).optional(),
  target: FcmTargetSchema,
});

// ─── POST /api/firebase/fcm ───────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = FcmBodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { title, body, imageUrl, data, target } = parsed.data;

    const notification: Notification = {
      title,
      body,
      ...(imageUrl ? { imageUrl } : {}),
    };

    const messaging = await getMessaging();

    if (target.type === "users") {
      // Send to multiple tokens (batch)
      const response = await messaging.sendEachForMulticast({
        tokens: target.tokens,
        notification,
        data: data ?? {},
        android: { priority: "high" },
        apns: { payload: { aps: { sound: "default" } } },
      });

      return NextResponse.json({
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        sentAt: new Date().toISOString(),
      });
    }

    let messageId: string;

    if (target.type === "token") {
      messageId = await messaging.send({
        token: target.value,
        notification,
        data: data ?? {},
        android: { priority: "high" },
        apns: { payload: { aps: { sound: "default" } } },
      });
    } else {
      const topic = target.type === "all" ? "all" : target.value;
      messageId = await messaging.send({
        topic,
        notification,
        data: data ?? {},
        android: { priority: "high" },
        apns: { payload: { aps: { sound: "default" } } },
      });
    }

    return NextResponse.json({
      success: true,
      messageId,
      sentAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[FCM] Send error:", message);
    return NextResponse.json(
      { error: "Falha ao enviar notificação", detail: message },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/firebase/fcm/route.ts
git commit -m "feat(push): support multi-user FCM target with sendEachForMulticast"
```

---

## Task 9: Rewrite Push Page — Integrate All Features

**Files:**
- Modify: `src/app/(dashboard)/push/page.tsx`

- [ ] **Step 1: Rewrite the push page integrating upload, scheduling, and multi-user**

```tsx
// src/app/(dashboard)/push/page.tsx
"use client";

import { useState } from "react";
import { z } from "zod";
import {
  Bell,
  Send,
  Users,
  User,
  Megaphone,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  CalendarClock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "./components/image-upload";
import { UserAutocomplete, type UserOption } from "./components/user-autocomplete";
import { SchedulePicker } from "./components/schedule-picker";

// ─── Types ────────────────────────────────────────────────────────────────────

type TargetType = "all" | "topic" | "token" | "users";
type SendStatus = "idle" | "sending" | "success" | "error";

interface SentNotification {
  id: string;
  title: string;
  body: string;
  target: string;
  sentAt: string;
  status: "success" | "error" | "scheduled";
  messageId?: string;
}

interface Template {
  id: string;
  name: string;
  title: string;
  body: string;
  target: { type: TargetType; value: string };
}

// ─── Zod schema ──────────────────────────────────────────────────────────────

const FormSchema = z.object({
  title: z.string().min(1, "Título obrigatório").max(100),
  body: z.string().min(1, "Corpo obrigatório").max(300),
  imageUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  dataJson: z.string().optional(),
  targetType: z.enum(["all", "topic", "token", "users"]),
  targetValue: z.string().optional(),
});

type FormData = z.infer<typeof FormSchema>;

// ─── Templates ───────────────────────────────────────────────────────────────

const TEMPLATES: Template[] = [
  {
    id: "1",
    name: "Novo Lead Disponível",
    title: "Novo lead disponível!",
    body: "Um novo lead foi publicado na sua categoria. Confira agora!",
    target: { type: "topic", value: "profissionais" },
  },
  {
    id: "2",
    name: "Créditos Esgotando",
    title: "Seus créditos estão acabando",
    body: "Você tem poucos créditos restantes. Renove seu plano para continuar.",
    target: { type: "topic", value: "empresas" },
  },
  {
    id: "3",
    name: "Manutenção Programada",
    title: "Manutenção programada",
    body: "O sistema ficará indisponível por 30 minutos nesta madrugada.",
    target: { type: "all", value: "all" },
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function targetLabel(type: TargetType, value: string, userCount?: number): string {
  if (type === "all") return "Todos os usuários";
  if (type === "topic") {
    if (value === "empresas") return "Tópico: Empresas";
    if (value === "profissionais") return "Tópico: Profissionais";
    return `Tópico: ${value}`;
  }
  if (type === "users") return `${userCount ?? 0} usuário(s) selecionado(s)`;
  return `Token: ${value.slice(0, 20)}...`;
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 0) return "agendado";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  return `${Math.floor(hours / 24)}d atrás`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PushPage() {
  const [form, setForm] = useState<FormData>({
    title: "",
    body: "",
    imageUrl: "",
    dataJson: "",
    targetType: "all",
    targetValue: "",
  });
  const [selectedUsers, setSelectedUsers] = useState<UserOption[]>([]);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [sendStatus, setSendStatus] = useState<SendStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [history, setHistory] = useState<SentNotification[]>([]);

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function applyTemplate(template: Template) {
    setForm({
      title: template.title,
      body: template.body,
      imageUrl: "",
      dataJson: "",
      targetType: template.target.type,
      targetValue: template.target.value,
    });
    setSelectedUsers([]);
    setScheduleEnabled(false);
    setScheduledAt("");
    setErrors({});
    setSendStatus("idle");
  }

  async function handleSend() {
    const result = FormSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      for (const [k, msgs] of Object.entries(result.error.flatten().fieldErrors)) {
        fieldErrors[k as keyof FormData] = msgs?.[0];
      }
      setErrors(fieldErrors);
      return;
    }

    // Validate users target
    if (form.targetType === "users" && selectedUsers.length === 0) {
      setErrors({ targetValue: "Selecione ao menos um usuário" });
      return;
    }

    // Validate schedule
    if (scheduleEnabled && !scheduledAt) {
      setErrors({ targetValue: "Selecione a data e hora do agendamento" });
      return;
    }

    let dataPayload: Record<string, string> | undefined;
    if (form.dataJson?.trim()) {
      try {
        dataPayload = JSON.parse(form.dataJson);
      } catch {
        setErrors((prev) => ({ ...prev, dataJson: "JSON inválido" }));
        return;
      }
    }

    setSendStatus("sending");
    setErrorMessage("");

    try {
      if (scheduleEnabled) {
        // Schedule for later
        const res = await fetch("/api/push/schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            body: form.body,
            imageUrl: form.imageUrl || undefined,
            dataPayload,
            targetType: form.targetType,
            targetValue: form.targetValue || undefined,
            targetUsers: form.targetType === "users"
              ? selectedUsers.map((u) => ({ id: u.id, fcmToken: u.fcmToken }))
              : undefined,
            scheduledAt: new Date(scheduledAt).toISOString(),
          }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Erro ao agendar");

        setSendStatus("success");
        setHistory((prev) => [{
          id: json.id,
          title: form.title,
          body: form.body,
          target: targetLabel(form.targetType, form.targetValue ?? "", selectedUsers.length),
          sentAt: new Date(scheduledAt).toISOString(),
          status: "scheduled",
        }, ...prev]);
      } else {
        // Send immediately
        const target = form.targetType === "users"
          ? { type: "users" as const, tokens: selectedUsers.map((u) => u.fcmToken) }
          : form.targetType === "all"
            ? { type: "all" as const, value: "all" }
            : { type: form.targetType, value: form.targetValue ?? "" };

        const res = await fetch("/api/firebase/fcm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            body: form.body,
            imageUrl: form.imageUrl || undefined,
            data: dataPayload,
            target,
          }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Erro desconhecido");

        setSendStatus("success");
        setHistory((prev) => [{
          id: crypto.randomUUID(),
          title: form.title,
          body: form.body,
          target: targetLabel(form.targetType, form.targetValue ?? "", selectedUsers.length),
          sentAt: new Date().toISOString(),
          status: "success",
          messageId: json.messageId,
        }, ...prev]);
      }

      // Reset after 2s
      setTimeout(() => {
        setForm({ title: "", body: "", imageUrl: "", dataJson: "", targetType: "all", targetValue: "" });
        setSelectedUsers([]);
        setScheduleEnabled(false);
        setScheduledAt("");
        setSendStatus("idle");
      }, 2000);
    } catch (err) {
      setSendStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Falha ao enviar");
      setHistory((prev) => [{
        id: crypto.randomUUID(),
        title: form.title,
        body: form.body,
        target: targetLabel(form.targetType, form.targetValue ?? "", selectedUsers.length),
        sentAt: new Date().toISOString(),
        status: "error",
      }, ...prev]);
    }
  }

  const isSending = sendStatus === "sending";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Push Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Envie notificações via Firebase Cloud Messaging
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Compose form */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4" />
                Compor Notificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="push-title">
                  Título <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="push-title"
                  placeholder="Ex: Novo lead disponível!"
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  maxLength={100}
                  disabled={isSending}
                />
                <div className="flex justify-between">
                  {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                  <p className="ml-auto text-xs text-muted-foreground">{form.title.length}/100</p>
                </div>
              </div>

              {/* Body */}
              <div className="space-y-1.5">
                <Label htmlFor="push-body">
                  Corpo <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="push-body"
                  placeholder="Ex: Um novo lead foi publicado na sua categoria."
                  value={form.body}
                  onChange={(e) => setField("body", e.target.value)}
                  maxLength={300}
                  rows={3}
                  disabled={isSending}
                />
                <div className="flex justify-between">
                  {errors.body && <p className="text-xs text-red-500">{errors.body}</p>}
                  <p className="ml-auto text-xs text-muted-foreground">{form.body.length}/300</p>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-1.5">
                <Label>Imagem (opcional)</Label>
                <ImageUpload
                  value={form.imageUrl ?? ""}
                  onChange={(url) => setField("imageUrl", url)}
                  disabled={isSending}
                />
              </div>

              {/* Data payload */}
              <div className="space-y-1.5">
                <Label htmlFor="push-data">
                  Data Payload <span className="text-muted-foreground font-normal">(JSON, opcional)</span>
                </Label>
                <Textarea
                  id="push-data"
                  placeholder={'{ "screen": "leads", "id": "123" }'}
                  value={form.dataJson}
                  onChange={(e) => setField("dataJson", e.target.value)}
                  rows={2}
                  className="font-mono text-sm"
                  disabled={isSending}
                />
                {errors.dataJson && <p className="text-xs text-red-500">{errors.dataJson}</p>}
              </div>

              {/* Target */}
              <div className="space-y-3">
                <Label>Destinatário</Label>
                <div className="flex gap-2">
                  <Select
                    value={form.targetType}
                    onValueChange={(v) => {
                      setField("targetType", v as TargetType);
                      setField("targetValue", "");
                      setSelectedUsers([]);
                    }}
                    disabled={isSending}
                  >
                    <SelectTrigger className="w-52">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <span className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5" />
                          Todos os usuários
                        </span>
                      </SelectItem>
                      <SelectItem value="topic">
                        <span className="flex items-center gap-2">
                          <Megaphone className="h-3.5 w-3.5" />
                          Segmento (tópico)
                        </span>
                      </SelectItem>
                      <SelectItem value="users">
                        <span className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5" />
                          Usuários específicos
                        </span>
                      </SelectItem>
                      <SelectItem value="token">
                        <span className="flex items-center gap-2">
                          <Bell className="h-3.5 w-3.5" />
                          Token FCM direto
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {form.targetType === "topic" && (
                    <Select
                      value={form.targetValue}
                      onValueChange={(v) => setField("targetValue", v)}
                      disabled={isSending}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione o segmento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="empresas">Empresas</SelectItem>
                        <SelectItem value="profissionais">Profissionais</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {form.targetType === "users" && (
                  <UserAutocomplete
                    selected={selectedUsers}
                    onChange={setSelectedUsers}
                    disabled={isSending}
                  />
                )}

                {form.targetType === "token" && (
                  <div className="space-y-1.5">
                    <Input
                      placeholder="FCM device token"
                      value={form.targetValue}
                      onChange={(e) => setField("targetValue", e.target.value)}
                      disabled={isSending}
                    />
                  </div>
                )}

                {errors.targetValue && (
                  <p className="text-xs text-red-500">{errors.targetValue}</p>
                )}
              </div>

              {/* Schedule */}
              <SchedulePicker
                enabled={scheduleEnabled}
                onEnabledChange={setScheduleEnabled}
                scheduledAt={scheduledAt}
                onScheduledAtChange={setScheduledAt}
                disabled={isSending}
              />

              {/* Status feedback */}
              {sendStatus === "success" && (
                <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-sm text-emerald-500">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {scheduleEnabled ? "Notificação agendada com sucesso!" : "Notificação enviada com sucesso!"}
                </div>
              )}
              {sendStatus === "error" && (
                <div className="flex items-center gap-2 rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-500">
                  <XCircle className="h-4 w-4 shrink-0" />
                  {errorMessage}
                </div>
              )}

              {/* Send button */}
              <Button
                className="w-full"
                onClick={handleSend}
                disabled={isSending || sendStatus === "success"}
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {scheduleEnabled ? "Agendando..." : "Enviando..."}
                  </>
                ) : scheduleEnabled ? (
                  <>
                    <CalendarClock className="mr-2 h-4 w-4" />
                    Agendar Notificação
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Notificação
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Templates sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Templates</CardTitle>
              <CardDescription>Clique para preencher o formulário</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => applyTemplate(tpl)}
                  className="w-full text-left rounded-md border border-border p-3 hover:bg-accent hover:border-accent-foreground/20 transition-colors"
                  disabled={isSending}
                >
                  <p className="text-sm font-medium leading-tight">{tpl.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{tpl.body}</p>
                  <Badge variant="outline" className="mt-1.5 text-xs">
                    {targetLabel(tpl.target.type, tpl.target.value)}
                  </Badge>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            Histórico de Envios
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhuma notificação enviada ainda.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {history.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {item.status === "success" ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    ) : item.status === "scheduled" ? (
                      <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.body}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{item.target}</Badge>
                        {item.status === "scheduled" && (
                          <Badge variant="outline" className="text-xs text-blue-500">Agendado</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                    {formatRelativeTime(item.sentAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(dashboard)/push/page.tsx
git commit -m "feat(push): integrate image upload, scheduling, and multi-user targeting"
```

---

## Task 10: Edge Function — Process Scheduled Pushes (FCM Dispatch)

**Files:**
- Create: `src/app/api/push/process-scheduled/route.ts`

This route is called by a Supabase Database Webhook when `scheduled_pushes.status` changes to `'sent'`.

- [ ] **Step 1: Create the processing endpoint**

```typescript
// src/app/api/push/process-scheduled/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// This endpoint is called by Supabase webhook or cron to actually fire the FCM messages
// for pushes that were marked as 'sent' by pg_cron
export async function POST(request: NextRequest) {
  // Simple auth: check for a secret header
  const authHeader = request.headers.get("x-webhook-secret");
  if (authHeader !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Get pushes marked as 'sent' that haven't actually been dispatched
  const { data: pushes, error } = await supabase
    .from("scheduled_pushes")
    .select("*")
    .eq("status", "sent")
    .is("sent_at", null)
    .limit(50);

  if (error || !pushes?.length) {
    return NextResponse.json({ processed: 0 });
  }

  let processed = 0;

  for (const push of pushes) {
    try {
      const target = push.target_type === "users"
        ? { type: "users", tokens: (push.target_users as { fcmToken: string }[]).map((u) => u.fcmToken) }
        : push.target_type === "all"
          ? { type: "all", value: "all" }
          : { type: push.target_type, value: push.target_value ?? "" };

      // Call our own FCM endpoint internally
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const res = await fetch(`${baseUrl}/api/firebase/fcm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: push.title,
          body: push.body,
          imageUrl: push.image_url || undefined,
          data: push.data_payload ?? undefined,
          target,
        }),
      });

      if (res.ok) {
        await supabase
          .from("scheduled_pushes")
          .update({ sent_at: new Date().toISOString() })
          .eq("id", push.id);
        processed++;
      } else {
        const json = await res.json();
        await supabase
          .from("scheduled_pushes")
          .update({ status: "failed", error_message: json.error ?? "FCM error" })
          .eq("id", push.id);
      }
    } catch (err) {
      await supabase
        .from("scheduled_pushes")
        .update({ status: "failed", error_message: err instanceof Error ? err.message : "Unknown" })
        .eq("id", push.id);
    }
  }

  return NextResponse.json({ processed });
}
```

- [ ] **Step 2: Add WEBHOOK_SECRET to `.env.local`**

Add `WEBHOOK_SECRET=your-random-secret-here` to `.env.local`

- [ ] **Step 3: Commit**

```bash
git add src/app/api/push/process-scheduled/route.ts
git commit -m "feat(push): add process-scheduled endpoint for webhook dispatch"
```

---

## Task 11: Update pg_cron to call the webhook

- [ ] **Step 1: Update the cron function to use pg_net for HTTP call**

```sql
-- Alternative: update the cron to call the processing endpoint via pg_net
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Drop the old simple cron
SELECT cron.unschedule('process-scheduled-pushes');

-- New cron that calls the webhook endpoint
SELECT cron.schedule(
  'process-scheduled-pushes',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.app_url') || '/api/push/process-scheduled',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', current_setting('app.settings.webhook_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);
```

Note: `app.settings.app_url` and `app.settings.webhook_secret` must be configured in Supabase project settings (Database → Settings → Custom config).

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/001_scheduled_pushes.sql
git commit -m "feat(push): use pg_net in cron to call processing webhook"
```

---

## Summary of new/modified files

| # | File | Action |
|---|------|--------|
| 1 | `src/app/api/storage/upload/route.ts` | CREATE |
| 2 | `src/app/(dashboard)/push/components/image-upload.tsx` | CREATE |
| 3 | `src/app/api/users/search/route.ts` | CREATE |
| 4 | `src/app/(dashboard)/push/components/user-autocomplete.tsx` | CREATE |
| 5 | `src/app/(dashboard)/push/components/schedule-picker.tsx` | CREATE |
| 6 | `supabase/migrations/001_scheduled_pushes.sql` | CREATE |
| 7 | `src/app/api/push/schedule/route.ts` | CREATE |
| 8 | `src/app/api/firebase/fcm/route.ts` | MODIFY |
| 9 | `src/app/(dashboard)/push/page.tsx` | REWRITE |
| 10 | `src/app/api/push/process-scheduled/route.ts` | CREATE |

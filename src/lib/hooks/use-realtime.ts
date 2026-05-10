"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface UseRealtimeOptions {
  table: string;
  schema?: string;
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  filter?: string; // e.g., "condition=eq.Opened"
  queryKey: string[]; // React Query key to invalidate
}

/**
 * Subscribe to Supabase Realtime changes and invalidate React Query cache.
 *
 * Usage:
 *   useRealtime({ table: "services", queryKey: ["services"] })
 *   useRealtime({ table: "services", filter: "condition=eq.Opened", queryKey: ["services", "opened"] })
 */
export function useRealtime({
  table,
  schema = "public",
  event = "*",
  filter,
  queryKey,
}: UseRealtimeOptions) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();

    let channel: RealtimeChannel;

    const channelName = `realtime:${table}:${filter ?? "all"}`;

    if (filter) {
      channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          { event, schema, table, filter },
          () => {
            queryClient.invalidateQueries({ queryKey });
          }
        )
        .subscribe();
    } else {
      channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          { event, schema, table },
          () => {
            queryClient.invalidateQueries({ queryKey });
          }
        )
        .subscribe();
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, schema, event, filter, queryKey, queryClient]);
}

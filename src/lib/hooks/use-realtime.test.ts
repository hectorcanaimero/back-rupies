import { describe, it, expect, vi } from "vitest";

// Mock supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    channel: () => ({
      on: function () {
        return this;
      },
      subscribe: function () {
        return this;
      },
    }),
    removeChannel: vi.fn(),
  }),
}));

// Mock react-query
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

describe("useRealtime", () => {
  it("exports useRealtime function", async () => {
    const mod = await import("./use-realtime");
    expect(mod.useRealtime).toBeDefined();
    expect(typeof mod.useRealtime).toBe("function");
  });
});

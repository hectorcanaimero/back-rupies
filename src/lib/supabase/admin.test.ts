import { describe, it, expect, vi, afterEach } from "vitest";
import { createAdminClient } from "./admin";
import { isAdminEmail } from "./middleware";

describe("BACKOFFICE_READ_ONLY", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("blocks writes before any request reaches Supabase", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test");
    vi.stubEnv("BACKOFFICE_READ_ONLY", "true");
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const { error } = await createAdminClient()
      .from("rp_categories")
      .update({ active: false })
      .eq("id", "x");

    expect(error?.message).toBe("backoffice em modo somente leitura");
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});

describe("isAdminEmail", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("matches the allowlist case-insensitively and rejects everyone else", () => {
    vi.stubEnv("ADMIN_EMAILS", " Admin@Rupies.com , other@x.com");
    expect(isAdminEmail("admin@rupies.com")).toBe(true);
    expect(isAdminEmail("other@x.com")).toBe(true);
    expect(isAdminEmail("intruder@x.com")).toBe(false);
    expect(isAdminEmail(null)).toBe(false);
  });

  it("denies everyone when ADMIN_EMAILS is unset", () => {
    vi.stubEnv("ADMIN_EMAILS", "");
    expect(isAdminEmail("admin@rupies.com")).toBe(false);
  });
});

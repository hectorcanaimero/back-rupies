import { describe, it, expect } from "vitest";
import { getUserStatus } from "./constants";

describe("getUserStatus", () => {
  it("returns banned when ban=true", () => {
    expect(getUserStatus({ ban: true, status: true, endRegister: true })).toBe("banned");
  });
  it("returns incomplete when endRegister=false", () => {
    expect(getUserStatus({ ban: false, status: true, endRegister: false })).toBe("incomplete");
  });
  it("returns inactive when status=false", () => {
    expect(getUserStatus({ ban: false, status: false, endRegister: true })).toBe("inactive");
  });
  it("returns active for normal user", () => {
    expect(getUserStatus({ ban: false, status: true, endRegister: true })).toBe("active");
  });
  it("ban takes priority over incomplete", () => {
    expect(getUserStatus({ ban: true, status: true, endRegister: false })).toBe("banned");
  });
});

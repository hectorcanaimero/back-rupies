import { describe, it, expect } from "vitest";
import { getUserStatus } from "./constants";

describe("getUserStatus", () => {
  it("returns banned when ban=true", () => {
    expect(getUserStatus({ ban: true, status: true, end_register: true })).toBe("banned");
  });
  it("returns incomplete when end_register=false", () => {
    expect(getUserStatus({ ban: false, status: true, end_register: false })).toBe("incomplete");
  });
  it("returns inactive when status=false", () => {
    expect(getUserStatus({ ban: false, status: false, end_register: true })).toBe("inactive");
  });
  it("returns active for normal user", () => {
    expect(getUserStatus({ ban: false, status: true, end_register: true })).toBe("active");
  });
  it("ban takes priority over incomplete", () => {
    expect(getUserStatus({ ban: true, status: true, end_register: false })).toBe("banned");
  });
});

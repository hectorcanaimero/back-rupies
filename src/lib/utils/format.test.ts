import { describe, it, expect } from "vitest";
import {
  formatCPFCNPJ,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPhone,
  formatRelativeTime,
} from "./format";

describe("formatCPFCNPJ", () => {
  it("formats 11-digit CPF", () => {
    expect(formatCPFCNPJ("12345678901")).toBe("123.456.789-01");
  });
  it("formats 14-digit CNPJ", () => {
    expect(formatCPFCNPJ("12345678000190")).toBe("12.345.678/0001-90");
  });
  it("handles already formatted input", () => {
    expect(formatCPFCNPJ("123.456.789-01")).toBe("123.456.789-01");
  });
  it("returns dash for null/undefined", () => {
    expect(formatCPFCNPJ(null)).toBe("—");
    expect(formatCPFCNPJ(undefined)).toBe("—");
  });
  it("returns original for invalid length", () => {
    expect(formatCPFCNPJ("12345")).toBe("12345");
  });
});

describe("formatCurrency", () => {
  it("formats positive values", () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain("1.234,56");
    expect(result).toContain("R$");
  });
  it("formats zero", () => {
    expect(formatCurrency(0)).toContain("0,00");
  });
  it("handles null/undefined", () => {
    expect(formatCurrency(null)).toBe("R$ 0,00");
    expect(formatCurrency(undefined)).toBe("R$ 0,00");
  });
});

describe("formatDate", () => {
  it("formats ISO date to pt-BR", () => {
    const result = formatDate("2026-05-10T14:30:00Z");
    expect(result).toMatch(/10\/05\/2026/);
  });
  it("returns dash for null", () => {
    expect(formatDate(null)).toBe("—");
  });
  it("returns dash for invalid date", () => {
    expect(formatDate("not-a-date")).toBe("—");
  });
});

describe("formatDateTime", () => {
  it("returns dash for null", () => {
    expect(formatDateTime(null)).toBe("—");
  });
  it("returns dash for invalid date", () => {
    expect(formatDateTime("not-a-date")).toBe("—");
  });
  it("formats valid ISO date", () => {
    const result = formatDateTime("2026-05-10T14:30:00Z");
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});

describe("formatPhone", () => {
  it("formats 11-digit mobile", () => {
    expect(formatPhone("11999998888")).toBe("(11) 99999-8888");
  });
  it("formats 10-digit landline", () => {
    expect(formatPhone("1133334444")).toBe("(11) 3333-4444");
  });
  it("returns dash for null", () => {
    expect(formatPhone(null)).toBe("—");
  });
  it("returns original for invalid length", () => {
    expect(formatPhone("123")).toBe("123");
  });
});

describe("formatRelativeTime", () => {
  it("returns 'agora' for very recent", () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now)).toBe("agora");
  });
  it("returns dash for null", () => {
    expect(formatRelativeTime(null)).toBe("—");
  });
  it("returns dash for invalid date", () => {
    expect(formatRelativeTime("invalid")).toBe("—");
  });
});

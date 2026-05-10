import { describe, it, expect } from "vitest";
import {
  formatBillingCycle,
  formatCredits,
  formatCurrency,
  formatDate,
  formatPhone,
  formatCPFCNPJ,
} from "./format";

describe("formatBillingCycle", () => {
  it("returns 'Mensal' for monthly", () => {
    expect(formatBillingCycle("monthly")).toBe("Mensal");
  });
  it("returns 'Anual' for yearly", () => {
    expect(formatBillingCycle("yearly")).toBe("Anual");
  });
  it("returns '—' for null", () => {
    expect(formatBillingCycle(null)).toBe("—");
  });
  it("passes through unknown values", () => {
    expect(formatBillingCycle("weekly")).toBe("weekly");
  });
});

describe("formatCredits", () => {
  it("returns 'Ilimitado' when is_unlimited is true", () => {
    expect(formatCredits(10, 100, true)).toBe("Ilimitado");
  });
  it("returns used/granted string", () => {
    expect(formatCredits(23, 50, false)).toBe("23/50");
  });
  it("handles nulls gracefully", () => {
    expect(formatCredits(null, null, false)).toBe("0/0");
  });
});

describe("formatCurrency", () => {
  it("formats BRL correctly", () => {
    expect(formatCurrency(1234.56)).toBe("R$\u00a01.234,56");
  });
  it("returns R$ 0,00 for null", () => {
    expect(formatCurrency(null)).toBe("R$\u00a00,00");
  });
});

describe("formatDate", () => {
  it("returns '—' for null", () => {
    expect(formatDate(null)).toBe("—");
  });
  it("formats ISO string to pt-BR", () => {
    expect(formatDate("2026-05-10T00:00:00Z")).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});

describe("formatPhone", () => {
  it("formats 11-digit mobile number", () => {
    expect(formatPhone("11999998888")).toBe("(11) 99999-8888");
  });
  it("formats 10-digit landline number", () => {
    expect(formatPhone("1133334444")).toBe("(11) 3333-4444");
  });
  it("returns '—' for null", () => {
    expect(formatPhone(null)).toBe("—");
  });
});

describe("formatCPFCNPJ", () => {
  it("formats CPF (11 digits)", () => {
    expect(formatCPFCNPJ("12345678901")).toBe("123.456.789-01");
  });
  it("formats CNPJ (14 digits)", () => {
    expect(formatCPFCNPJ("12345678000190")).toBe("12.345.678/0001-90");
  });
  it("returns '—' for null", () => {
    expect(formatCPFCNPJ(null)).toBe("—");
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { toCsv, downloadCsv } from "./export-csv";

describe("toCsv", () => {
  it("returns empty string for empty array", () => {
    expect(toCsv([])).toBe("");
  });

  it("generates header row from object keys", () => {
    const result = toCsv([{ name: "Alice", age: 30 }]);
    expect(result.startsWith("name,age")).toBe(true);
  });

  it("generates data rows", () => {
    const result = toCsv([{ name: "Alice", age: 30 }]);
    const lines = result.split("\r\n");
    expect(lines[0]).toBe("name,age");
    expect(lines[1]).toBe("Alice,30");
  });

  it("handles null and undefined values as empty string", () => {
    const result = toCsv([{ name: null, age: undefined } as unknown as Record<string, unknown>]);
    const lines = result.split("\r\n");
    expect(lines[1]).toBe(",");
  });

  it("quotes values containing commas", () => {
    const result = toCsv([{ name: "Smith, John", age: 25 }]);
    const lines = result.split("\r\n");
    expect(lines[1]).toBe('"Smith, John",25');
  });

  it("escapes double quotes inside values", () => {
    const result = toCsv([{ name: 'She said "hello"', age: 25 }]);
    const lines = result.split("\r\n");
    expect(lines[1]).toBe('"She said ""hello""",25');
  });

  it("quotes values containing newlines", () => {
    const result = toCsv([{ name: "line1\nline2", age: 25 }]);
    const lines = result.split("\r\n");
    // The value will be quoted; it contains a newline inside the quotes
    expect(lines[1].startsWith('"line1')).toBe(true);
  });

  it("uses custom column definitions when provided", () => {
    const result = toCsv(
      [{ id: "1", name: "Elétrica", active: true }],
      [
        { key: "name", label: "Nome" },
        { key: "active", label: "Ativo" },
      ]
    );
    const lines = result.split("\r\n");
    expect(lines[0]).toBe("Nome,Ativo");
    expect(lines[1]).toBe("Elétrica,true");
    // 'id' not included because it's not in columns
    expect(lines[1]).not.toContain("1");
  });

  it("handles multiple rows", () => {
    const data = [
      { name: "Alice", city: "São Paulo" },
      { name: "Bob", city: "Rio de Janeiro" },
    ];
    const result = toCsv(data);
    const lines = result.split("\r\n");
    expect(lines).toHaveLength(3); // header + 2 rows
    expect(lines[2]).toBe("Bob,Rio de Janeiro");
  });

  it("uses CRLF line endings (RFC 4180)", () => {
    const result = toCsv([{ a: "1" }, { a: "2" }]);
    expect(result).toContain("\r\n");
  });
});

describe("downloadCsv", () => {
  beforeEach(() => {
    // Mock browser APIs not available in jsdom
    const mockLink = {
      href: "",
      download: "",
      style: { display: "" },
      click: vi.fn(),
    };
    vi.spyOn(document, "createElement").mockReturnValue(
      mockLink as unknown as HTMLElement
    );
    vi.spyOn(document.body, "appendChild").mockImplementation(() => mockLink as unknown as Node);
    vi.spyOn(document.body, "removeChild").mockImplementation(() => mockLink as unknown as Node);
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:mock-url"),
      revokeObjectURL: vi.fn(),
    });
  });

  it("triggers a download with correct filename", () => {
    downloadCsv([{ name: "test" }], "usuarios");
    expect(document.createElement).toHaveBeenCalledWith("a");
  });

  it("does not throw for empty data", () => {
    expect(() => downloadCsv([], "empty")).not.toThrow();
  });
});

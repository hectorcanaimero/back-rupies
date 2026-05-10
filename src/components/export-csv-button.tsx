"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/utils/export-csv";

interface ColumnDef {
  key: string;
  label: string;
}

interface ExportCsvButtonProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>[];
  filename: string;
  columns?: ColumnDef[];
}

export function ExportCsvButton({ data, filename, columns }: ExportCsvButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() =>
        downloadCsv(
          data,
          filename,
          columns as { key: string; label: string }[] | undefined
        )
      }
    >
      <Download className="h-4 w-4 mr-1" />
      Exportar CSV
    </Button>
  );
}

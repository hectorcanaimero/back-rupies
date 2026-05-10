import { cn } from "@/lib/utils";

interface Field {
  label: string;
  value: React.ReactNode;
}

interface FieldGridProps {
  fields: Field[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function FieldGrid({ fields, columns = 2, className }: FieldGridProps) {
  const gridCols = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {fields.map((field, i) => (
        <div key={i} className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {field.label}
          </p>
          <p className="text-sm font-medium">{field.value ?? "—"}</p>
        </div>
      ))}
    </div>
  );
}

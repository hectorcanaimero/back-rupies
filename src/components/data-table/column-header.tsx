"use client";

import { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const sorted = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "-ml-3 h-8 text-xs font-semibold uppercase tracking-wider hover:bg-transparent hover:text-foreground",
        sorted && "text-foreground",
        className
      )}
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {title}
      {sorted === "desc" ? (
        <ArrowDown className="ml-1.5 h-3.5 w-3.5" />
      ) : sorted === "asc" ? (
        <ArrowUp className="ml-1.5 h-3.5 w-3.5" />
      ) : (
        <ChevronsUpDown className="ml-1.5 h-3.5 w-3.5 opacity-40" />
      )}
    </Button>
  );
}

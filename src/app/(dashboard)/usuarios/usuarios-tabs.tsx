"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DataTable } from "@/components/data-table/data-table";
import { ExportCsvButton } from "@/components/export-csv-button";
import { columns } from "./columns";
import type { User } from "@/types/app";

const CSV_COLUMNS = [
  { key: "id" as const, label: "ID" },
  { key: "name" as const, label: "Nome" },
  { key: "email" as const, label: "E-mail" },
  { key: "role" as const, label: "Tipo" },
  { key: "status" as const, label: "Status" },
  { key: "created_at" as const, label: "Criado em" },
];

export function UsuariosTabs({ users }: { users: User[] }) {
  const [tab, setTab] = useState("todos");

  const filtered = useMemo(() => {
    if (tab === "empresas") return users.filter((u) => u.role === "empresa");
    if (tab === "profissionais") return users.filter((u) => u.role === "prestador");
    return users;
  }, [users, tab]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usuários</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} registros
          </p>
        </div>
        <ExportCsvButton
          data={filtered}
          filename={`usuarios-${tab}`}
          columns={CSV_COLUMNS}
        />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="todos">
            Todos ({users.length})
          </TabsTrigger>
          <TabsTrigger value="empresas">
            Empresas ({users.filter((u) => u.role === "empresa").length})
          </TabsTrigger>
          <TabsTrigger value="profissionais">
            Profissionais ({users.filter((u) => u.role === "prestador").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          <DataTable
            columns={columns}
            data={filtered}
            searchKey="name"
            searchPlaceholder="Buscar por nome..."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

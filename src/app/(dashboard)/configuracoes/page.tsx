// src/app/(dashboard)/configuracoes/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { Setting } from "@/types/app";

// ── Mock defaults ─────────────────────────────────────────────────────────────
const MOCK_SETTINGS: Setting[] = [
  {
    id: "1",
    key: "app_name",
    value: "Rupies",
    description: "Nome exibido na plataforma",
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    key: "app_support_email",
    value: "suporte@rupies.com.br",
    description: "E-mail de suporte ao usuário",
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    key: "max_services_per_day",
    value: "10",
    description: "Máximo de serviços que uma empresa pode publicar por dia",
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    key: "max_leads_per_month",
    value: "50",
    description: "Máximo de leads por mês no plano gratuito",
    updated_at: new Date().toISOString(),
  },
  {
    id: "5",
    key: "enable_chat",
    value: "true",
    description: "Habilitar módulo de chat entre empresa e profissional",
    updated_at: new Date().toISOString(),
  },
  {
    id: "6",
    key: "enable_leads",
    value: "true",
    description: "Habilitar módulo de leads",
    updated_at: new Date().toISOString(),
  },
  {
    id: "7",
    key: "maintenance_mode",
    value: "false",
    description: "Ativar modo de manutenção (bloqueia acesso ao app)",
    updated_at: new Date().toISOString(),
  },
];

// ── Section grouping ──────────────────────────────────────────────────────────
const SECTIONS: { title: string; description: string; prefix: string }[] = [
  { title: "Geral", description: "Configurações gerais da plataforma", prefix: "app_" },
  { title: "Limites", description: "Limites operacionais por plano/período", prefix: "max_" },
  { title: "Feature Flags", description: "Ativar ou desativar funcionalidades", prefix: "enable_" },
];

function getSectionSettings(settings: Setting[], prefix: string): Setting[] {
  return settings.filter((s) => s.key.startsWith(prefix));
}

// ── SettingRow ─────────────────────────────────────────────────────────────────
function SettingRow({
  setting,
  onSave,
}: {
  setting: Setting;
  onSave: (id: string, value: string) => Promise<void>;
}) {
  const [value, setValue] = useState(setting.value ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const isDirty = value !== (setting.value ?? "");

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(setting.id, value);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  // Boolean flags get a special toggle display
  const isBoolean = value === "true" || value === "false";

  return (
    <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-mono font-medium">{setting.key}</p>
        {setting.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{setting.description}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isBoolean ? (
          <Badge
            variant={value === "true" ? "default" : "secondary"}
            className="cursor-pointer select-none"
            onClick={() => setValue(value === "true" ? "false" : "true")}
          >
            {value === "true" ? "Ativado" : "Desativado"}
          </Badge>
        ) : (
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-48 text-sm"
            disabled={saving}
          />
        )}
        {saved ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
        ) : (
          <Button
            size="sm"
            variant={isDirty ? "default" : "outline"}
            onClick={handleSave}
            disabled={saving || (!isDirty && !isBoolean)}
            className="w-16"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              "Salvar"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function ConfiguracoesPage() {
  const [settings, setSettings] = useState<Setting[]>(MOCK_SETTINGS);

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("settings")
          .select("*")
          .order("key", { ascending: true });
        if (!error && data && data.length > 0) setSettings(data as Setting[]);
      } catch {
        // fallback to mock
      }
    })();
  }, []);

  const handleSave = useCallback(async (id: string, value: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = createClient() as any;
      await db
        .from("settings")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("id", id);
    } catch {
      // optimistic
    }
    setSettings((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, value, updated_at: new Date().toISOString() } : s
      )
    );
  }, []);

  // Settings not covered by known sections
  const otherSettings = settings.filter(
    (s) => !SECTIONS.some((sec) => s.key.startsWith(sec.prefix))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie as configurações globais da plataforma
        </p>
      </div>

      {SECTIONS.map((section) => {
        const sectionSettings = getSectionSettings(settings, section.prefix);
        if (sectionSettings.length === 0) return null;
        return (
          <Card key={section.prefix}>
            <CardHeader>
              <CardTitle className="text-base">{section.title}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {sectionSettings.map((s) => (
                <SettingRow key={s.id} setting={s} onSave={handleSave} />
              ))}
            </CardContent>
          </Card>
        );
      })}

      {otherSettings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Outras</CardTitle>
            <CardDescription>Configurações sem categoria definida</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {otherSettings.map((s) => (
              <SettingRow key={s.id} setting={s} onSave={handleSave} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

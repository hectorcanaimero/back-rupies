"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const emailSchema = z.string().email("Email inválido");

function UnauthorizedBanner() {
  const searchParams = useSearchParams();
  const isUnauthorized = searchParams.get("error") === "unauthorized";

  if (!isUnauthorized) return null;

  return (
    <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
      Acesso não autorizado. Entre em contato com o administrador.
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEmailError(null);
    setSubmitError(null);

    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setEmailError(parsed.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + "/auth/callback",
        },
      });

      if (error) {
        setSubmitError("Erro ao enviar o link. Tente novamente.");
      } else {
        setSent(true);
      }
    } catch {
      setSubmitError("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-md bg-green-500/10 border border-green-500/30 px-4 py-3 text-sm text-green-400">
        Link enviado! Verifique seu email.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!emailError}
          disabled={loading}
          autoComplete="email"
        />
        {emailError && (
          <p className="text-xs text-destructive">{emailError}</p>
        )}
      </div>

      {submitError && (
        <p className="text-sm text-destructive">{submitError}</p>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Enviando..." : "Enviar link de acesso"}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <Card className="w-full max-w-sm mx-4">
      <CardHeader className="text-center">
        <CardTitle className="text-4xl font-bold text-purple-500">
          Rupies
        </CardTitle>
        <CardDescription className="text-base mt-1">
          Painel Administrativo
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <Suspense fallback={null}>
          <UnauthorizedBanner />
        </Suspense>
        <LoginForm />
      </CardContent>
    </Card>
  );
}

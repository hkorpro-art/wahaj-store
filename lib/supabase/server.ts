import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

let serverClient: SupabaseClient<Database> | undefined;

function requiredEnvironmentValue(name: string, value: string | undefined) {
  const normalized = value?.trim();
  if (!normalized) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }
  return normalized;
}

export function isSupabaseServerConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      (process.env.SUPABASE_SECRET_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim())
  );
}

/**
 * Server-only administrative client. Never import this module from a Client Component.
 * The secret/service-role key bypasses RLS and must remain confined to trusted server code.
 */
export function getSupabaseServerClient(): SupabaseClient<Database> {
  if (serverClient) return serverClient;

  const url = requiredEnvironmentValue("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const key = requiredEnvironmentValue(
    "SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY",
    secretKey || serviceRoleKey
  );

  serverClient = createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false
    }
  });

  return serverClient;
}

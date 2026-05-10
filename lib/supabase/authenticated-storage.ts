import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

export async function createAuthenticatedStorageClient(
  supabase: SupabaseClient<Database>,
) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accessToken = session?.access_token;

  if (!accessToken || !isJwt(accessToken)) {
    throw new Error(
      "Supabase Storage upload requires an authenticated user session. Sign out and sign in again, then retry the scan.",
    );
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    },
  );
}

function isJwt(value: string) {
  return value.split(".").length === 3;
}

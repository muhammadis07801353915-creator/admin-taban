import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.trim() !== '') ? process.env.NEXT_PUBLIC_SUPABASE_URL : 'https://kdlwstunxgbwxwafhvkm.supabase.co';

export async function GET() {
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      return NextResponse.json({ error: 'Service key missing' }, { status: 500 });
    }

    const adminSupabase = createClient(SUPABASE_URL, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Fetch profiles
    const { data: profiles, error: profileError } = await adminSupabase
      .from('profiles')
      .select('*')
      .order('updated_at', { ascending: false });

    if (profileError) throw profileError;

    // Fetch auth users metadata (to get country_code or raw phone)
    const { data: { users: authUsers }, error: authError } = await adminSupabase.auth.admin.listUsers();
    
    const userMetaMap: Record<string, { country_code?: string; phone?: string }> = {};
    if (authUsers) {
      authUsers.forEach((u) => {
        userMetaMap[u.id] = {
          country_code: u.user_metadata?.country_code,
          phone: u.user_metadata?.phone || u.phone
        };
      });
    }

    // Merge country_code into profiles
    const enrichedProfiles = (profiles || []).map((profile) => {
      const meta = userMetaMap[profile.id];
      return {
        ...profile,
        country_code: meta?.country_code || null,
        raw_phone: meta?.phone || profile.phone
      };
    });

    return NextResponse.json({ users: enrichedProfiles });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

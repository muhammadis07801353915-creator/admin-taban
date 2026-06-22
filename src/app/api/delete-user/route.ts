import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Hardcoded URL since it's public anyway
const SUPABASE_URL = 'https://kdlwstunxgbwxwafhvkm.supabase.co';

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceKey) {
      return NextResponse.json({ error: 'Service key missing' }, { status: 500 });
    }

    const adminSupabase = createClient(SUPABASE_URL, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // 1. Delete cars/listings by this user
    await adminSupabase.from('cars').delete().eq('user_id', userId);

    // 2. Delete profile
    await adminSupabase.from('profiles').delete().eq('id', userId);

    // 3. Delete the auth user permanently
    const { error } = await adminSupabase.auth.admin.deleteUser(userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('URL:', supabaseUrl ? 'set' : 'missing');
    console.log('KEY:', serviceKey ? 'set (len=' + serviceKey.length + ')' : 'missing');

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({
        error: 'Server configuration error',
        debug: { url: !!supabaseUrl, key: !!serviceKey }
      }, { status: 500 });
    }

    // Create admin client inside handler
    const adminSupabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // 1. Delete cars/listings by this user
    await adminSupabase.from('cars').delete().eq('user_id', userId);

    // 2. Delete profile
    await adminSupabase.from('profiles').delete().eq('id', userId);

    // 3. Delete the auth user permanently
    const { error } = await adminSupabase.auth.admin.deleteUser(userId);

    if (error) {
      console.error('Error deleting auth user:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Delete user error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

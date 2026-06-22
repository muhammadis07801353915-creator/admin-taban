import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Service role client - can delete auth.users
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // 1. Delete cars/listings by this user
    await adminSupabase.from('cars').delete().eq('user_id', userId);

    // 2. Delete profile
    await adminSupabase.from('profiles').delete().eq('id', userId);

    // 3. Delete the auth user (this permanently removes login access)
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

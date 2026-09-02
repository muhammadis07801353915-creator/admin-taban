import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const role = cookieStore.get('taban_admin_role')?.value;
  const auth = cookieStore.get('taban_admin_auth')?.value;

  if (auth === 'authenticated' && role) {
    return NextResponse.json({ authenticated: true, role });
  }

  return NextResponse.json({ authenticated: false, role: null });
}
